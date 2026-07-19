import { execFileSync } from 'node:child_process'
import { readFileSync, statSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const commitSha = /^[0-9a-f]{40}$/
const requiredProductionValues = [
  'APP_KEY',
  'APP_URL',
  'CORS_ORIGIN',
  'DATABASE_URL',
  'LLM_BASE_URL',
  'LLM_MODEL',
]

export function deploymentImages(imageRepository, sha) {
  return {
    backend: `${imageRepository}-backend:${sha}`,
    frontend: `${imageRepository}-frontend:${sha}`,
  }
}

export function validateDeploymentInput({ imageRepository, recoveryRef, sha }) {
  if (!commitSha.test(sha ?? ''))
    throw new Error('Release SHA must be a lowercase 40-character commit SHA.')
  if (!/^ghcr\.io\/[a-z0-9._/-]+$/.test(imageRepository ?? ''))
    throw new Error('IMAGE_REPOSITORY must be a lowercase ghcr.io repository prefix.')
  if (!recoveryRef?.trim()) throw new Error('A confirmed Neon recovery reference is required.')
}

const compose = (composeFile, ...args) => ['docker', ['compose', '-f', composeFile, ...args]]

export function deploymentPlan({ action, composeFile }) {
  const steps = [
    { label: 'validate-compose', command: compose(composeFile, 'config', '--quiet') },
    { label: 'pull-images', command: compose(composeFile, 'pull', 'gateway', 'api', 'worker') },
    { label: 'stop-writers', command: compose(composeFile, 'stop', 'api', 'worker') },
  ]
  if (action === 'deploy')
    steps.push({
      label: 'migrate-once',
      command: compose(composeFile, '--profile', 'operations', 'run', '--rm', 'migrate'),
    })
  steps.push(
    { label: 'start-stack', command: compose(composeFile, 'up', '-d', 'gateway', 'api', 'worker') },
    { label: 'verify-health', command: null }
  )
  return steps
}

export function failureRecoveryPlan({ composeFile, currentSha }) {
  if (!currentSha) {
    return [
      {
        label: 'stop-failed-stack',
        command: compose(composeFile, 'stop', 'gateway', 'api', 'worker'),
      },
    ]
  }
  return [
    {
      label: 'pull-previous-images',
      command: compose(composeFile, 'pull', 'gateway', 'api', 'worker'),
    },
    { label: 'stop-failed-writers', command: compose(composeFile, 'stop', 'api', 'worker') },
    {
      label: 'restore-previous-stack',
      command: compose(composeFile, 'up', '-d', 'gateway', 'api', 'worker'),
    },
    { label: 'verify-restored-health', command: null },
  ]
}

export function parseEnvironment(path) {
  const values = {}
  for (const rawLine of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const equals = line.indexOf('=')
    if (equals < 1) throw new Error(`Invalid environment entry in ${path}.`)
    const key = line.slice(0, equals).trim()
    if (!key) throw new Error(`Invalid environment entry in ${path}.`)
    let value = line.slice(equals + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    values[key] = value
  }
  return values
}

export function readReleaseState(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return {}
    throw new Error(`Release state file ${path} is invalid.`, { cause: error })
  }
}

function argumentsFrom(argv) {
  const [action, ...rest] = argv
  if (!['deploy', 'rollback'].includes(action))
    throw new Error('Action must be deploy or rollback.')
  const options = { action, execute: false }
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index]
    if (token === '--execute') options.execute = true
    else if (token.startsWith('--') && rest[index + 1]) options[token.slice(2)] = rest[++index]
    else throw new Error(`Unexpected argument: ${token}`)
  }
  return options
}

async function waitForHealth(port) {
  const deadline = Date.now() + 60_000
  const urls = [`http://127.0.0.1:${port}/healthz`, `http://127.0.0.1:${port}/api/health/ready`]
  while (Date.now() < deadline) {
    try {
      const responses = await Promise.all(urls.map((url) => fetch(url)))
      if (responses.every((response) => response.ok)) return
    } catch {}
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 2_000))
  }
  throw new Error('Gateway or API readiness did not become healthy within 60 seconds.')
}

async function runStep(step, environment, port, executeCommand, healthCheck, onStep) {
  onStep(step.label)
  if (step.command) executeCommand(step.command[0], step.command[1], environment)
  else await healthCheck(port)
}

export async function executeDeployment({
  action,
  commandEnvironment,
  composeFile,
  currentSha,
  executeCommand = (command, args, environment) =>
    execFileSync(command, args, { env: environment, stdio: 'inherit' }),
  healthCheck = waitForHealth,
  imageRepository,
  onStep = (label) => console.log(`[release] ${label}`),
  port = '8080',
}) {
  const plan = deploymentPlan({ action, composeFile })
  let startedNewStack = false
  try {
    for (const step of plan) {
      if (action === 'deploy' && step.label === 'start-stack') startedNewStack = true
      await runStep(step, commandEnvironment, port, executeCommand, healthCheck, onStep)
    }
  } catch (error) {
    if (!startedNewStack) throw error
    const recoveryImages = currentSha ? deploymentImages(imageRepository, currentSha) : null
    const recoveryEnvironment = recoveryImages
      ? {
          ...commandEnvironment,
          BACKEND_IMAGE: recoveryImages.backend,
          FRONTEND_IMAGE: recoveryImages.frontend,
        }
      : commandEnvironment
    for (const step of failureRecoveryPlan({ composeFile, currentSha })) {
      await runStep(step, recoveryEnvironment, port, executeCommand, healthCheck, onStep)
    }
    throw error
  }
}

async function main() {
  const options = argumentsFrom(process.argv.slice(2))
  const composeFile = resolve(options['compose-file'] ?? 'deploy/compose.yaml')
  const environmentFile = resolve(options['env-file'] ?? 'deploy/.env.production')
  const stateFile = resolve(options['state-file'] ?? 'deploy/.release-state.json')
  const values = parseEnvironment(environmentFile)
  const state = readReleaseState(stateFile)
  const sha = options.action === 'rollback' ? state.previousSha : options.sha
  const recoveryRef = options.action === 'deploy' ? options['recovery-ref'] : state.recoveryRef

  validateDeploymentInput({ imageRepository: values.IMAGE_REPOSITORY, recoveryRef, sha })
  for (const name of requiredProductionValues) {
    if (!values[name] || /^<.+>$/.test(values[name])) throw new Error(`${name} must be configured.`)
  }
  if (
    options.action === 'deploy' &&
    (!values.MIGRATION_DATABASE_URL || /^<.+>$/.test(values.MIGRATION_DATABASE_URL))
  )
    throw new Error('MIGRATION_DATABASE_URL must be configured for deployment.')
  if (options.execute && (statSync(environmentFile).mode & 0o077) !== 0)
    throw new Error('Production environment file must be mode 0600.')

  const images = deploymentImages(values.IMAGE_REPOSITORY, sha)
  const commandEnvironment = {
    ...process.env,
    ...values,
    BACKEND_IMAGE: images.backend,
    FRONTEND_IMAGE: images.frontend,
  }
  const plan = deploymentPlan({ action: options.action, composeFile })
  if (!options.execute) {
    console.log(
      JSON.stringify(
        { action: options.action, sha, recoveryRef, steps: plan.map((step) => step.label) },
        null,
        2
      )
    )
    return
  }

  await executeDeployment({
    action: options.action,
    commandEnvironment,
    composeFile,
    currentSha: state.currentSha ?? null,
    imageRepository: values.IMAGE_REPOSITORY,
    port: values.GATEWAY_PORT ?? '8080',
  })

  const nextState =
    options.action === 'rollback'
      ? { currentSha: sha, previousSha: state.currentSha, recoveryRef }
      : { currentSha: sha, previousSha: state.currentSha ?? null, recoveryRef }
  writeFileSync(stateFile, `${JSON.stringify(nextState, null, 2)}\n`, { mode: 0o600 })
  console.log(`[release] ${options.action} complete at ${sha}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : 'Release command failed.')
    process.exitCode = 1
  })
}
