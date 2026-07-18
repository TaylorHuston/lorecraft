import assert from 'node:assert/strict'
import test from 'node:test'

import {
  deploymentImages,
  deploymentPlan,
  executeDeployment,
  failureRecoveryPlan,
  validateDeploymentInput,
} from './release-command.mjs'

const sha = '0123456789abcdef0123456789abcdef01234567'

test('derives immutable frontend and backend images from one reviewed SHA', () => {
  assert.deepEqual(deploymentImages('ghcr.io/example/lorecraft', sha), {
    backend: `ghcr.io/example/lorecraft-backend:${sha}`,
    frontend: `ghcr.io/example/lorecraft-frontend:${sha}`,
  })
})

test('rejects mutable refs and missing production safety inputs', () => {
  assert.throws(
    () =>
      validateDeploymentInput({
        imageRepository: 'ghcr.io/example/lorecraft',
        recoveryRef: '',
        sha: 'main',
      }),
    /40-character commit SHA/
  )
  assert.throws(
    () =>
      validateDeploymentInput({
        imageRepository: 'example/lorecraft',
        recoveryRef: 'snapshot',
        sha,
      }),
    /ghcr.io/
  )
})

test('plans a coordinated migration release and an independent application rollback', () => {
  const release = deploymentPlan({ action: 'deploy', composeFile: 'deploy/compose.yaml' })
  assert.deepEqual(
    release.map((step) => step.label),
    [
      'validate-compose',
      'pull-images',
      'stop-writers',
      'migrate-once',
      'start-stack',
      'verify-health',
    ]
  )

  const rollback = deploymentPlan({ action: 'rollback', composeFile: 'deploy/compose.yaml' })
  assert.deepEqual(
    rollback.map((step) => step.label),
    ['validate-compose', 'pull-images', 'stop-writers', 'start-stack', 'verify-health']
  )
})

test('restores the previously running SHA after new application health fails', () => {
  assert.deepEqual(
    failureRecoveryPlan({ composeFile: 'deploy/compose.yaml', currentSha: sha }).map(
      (step) => step.label
    ),
    [
      'pull-previous-images',
      'stop-failed-writers',
      'restore-previous-stack',
      'verify-restored-health',
    ]
  )
  assert.deepEqual(
    failureRecoveryPlan({ composeFile: 'deploy/compose.yaml', currentSha: null }).map(
      (step) => step.label
    ),
    ['stop-failed-stack']
  )
})

test('a failed new-stack health check restores and verifies the current SHA', async () => {
  const labels = []
  const environments = []
  let healthChecks = 0

  await assert.rejects(
    executeDeployment({
      action: 'deploy',
      commandEnvironment: {
        BACKEND_IMAGE: 'ghcr.io/example/lorecraft-backend:new',
        FRONTEND_IMAGE: 'ghcr.io/example/lorecraft-frontend:new',
      },
      composeFile: 'deploy/compose.yaml',
      currentSha: sha,
      executeCommand: (_command, _args, environment) => environments.push(environment),
      healthCheck: async () => {
        healthChecks += 1
        if (healthChecks === 1) throw new Error('new stack unhealthy')
      },
      imageRepository: 'ghcr.io/example/lorecraft',
      onStep: (label) => labels.push(label),
    }),
    /new stack unhealthy/
  )

  assert.deepEqual(labels.slice(-4), [
    'pull-previous-images',
    'stop-failed-writers',
    'restore-previous-stack',
    'verify-restored-health',
  ])
  assert.equal(environments.at(-1).BACKEND_IMAGE, `ghcr.io/example/lorecraft-backend:${sha}`)
  assert.equal(healthChecks, 2)
})
