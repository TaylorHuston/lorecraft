import { spawn } from 'node:child_process'

export const requiredCiStages = [
  {
    id: 'build',
    label: 'Build applications and generate backend artifacts',
    npmArguments: ['run', 'build', '--', '--force'],
  },
  {
    id: 'contracts',
    label: 'Verify generated Tuyau client is current',
    npmArguments: ['run', 'check:contracts'],
  },
  {
    id: 'migrate',
    label: 'Apply guarded test migrations',
    npmArguments: ['run', 'migrate:ci', '--workspace', '@lorecraft/backend'],
  },
  {
    id: 'lint',
    label: 'Run lint',
    npmArguments: ['run', 'lint', '--', '--force'],
  },
  {
    id: 'typecheck',
    label: 'Run typecheck',
    npmArguments: ['run', 'typecheck', '--', '--force'],
  },
  {
    id: 'test',
    label: 'Run tests',
    npmArguments: ['run', 'test', '--', '--force'],
  },
  {
    id: 'storybook-build',
    label: 'Build Storybook',
    npmArguments: ['run', 'build:storybook'],
  },
  {
    id: 'storybook-test',
    label: 'Run Storybook browser tests',
    npmArguments: ['run', 'test:storybook'],
  },
  {
    id: 'e2e',
    label: 'Run account journey E2E',
    npmArguments: ['run', 'test:e2e'],
  },
]

const requiredEnvironmentNames = [
  'APP_KEY',
  'DATABASE_URL',
  'TEST_DATABASE_URL',
  'E2E_DATABASE_URL',
]

export function assertCiRequiredEnvironment(environment) {
  if (environment.NODE_ENV !== 'test') {
    throw new Error('ci:required requires NODE_ENV=test.')
  }

  const missing = requiredEnvironmentNames.filter((name) => !environment[name])

  if (missing.length > 0) {
    throw new Error(`ci:required requires caller-supplied ${missing.join(', ')}.`)
  }

  for (const acknowledgementName of ['ALLOW_TEST_DATABASE_WRITES', 'ALLOW_E2E_DATABASE_WRITES']) {
    if (environment[acknowledgementName] !== '1') {
      throw new Error(`ci:required requires ${acknowledgementName}=1.`)
    }
  }
}

export async function runRequiredCiGate({
  environment = process.env,
  stages = requiredCiStages,
  executeStage = executeNpmStage,
  write = process.stdout.write.bind(process.stdout),
} = {}) {
  assertCiRequiredEnvironment(environment)

  for (const stage of stages) {
    write(`\n==> ${stage.label}\n`)
    const exitCode = await executeStage(stage, environment)

    if (exitCode !== 0) {
      throw new Error(`ci:required stage ${stage.id} failed with exit code ${exitCode}.`)
    }
  }
}

export function executeNpmStage(stage, environment) {
  return new Promise((resolve, reject) => {
    const child = spawn('npm', stage.npmArguments, {
      env: environment,
      stdio: 'inherit',
    })

    child.once('error', reject)
    child.once('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`ci:required stage ${stage.id} ended from signal ${signal}.`))
        return
      }

      resolve(code ?? 1)
    })
  })
}

if (import.meta.main) {
  runRequiredCiGate().catch((error) => {
    console.error(error instanceof Error ? error.message : 'ci:required failed.')
    process.exitCode = 1
  })
}
