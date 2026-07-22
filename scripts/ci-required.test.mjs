import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { assertCiRequiredEnvironment, runRequiredCiGate } from './ci-required.mjs'

const safeEnvironment = {
  ALLOW_E2E_DATABASE_WRITES: '1',
  ALLOW_TEST_DATABASE_WRITES: '1',
  APP_KEY: 'base64:ci-required-test-key',
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/lorecraft_application',
  E2E_DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/lorecraft_e2e',
  NODE_ENV: 'test',
  TEST_DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/lorecraft_test',
}

test('ci:required refuses to start without caller-supplied guarded database environment', () => {
  assert.throws(
    () => assertCiRequiredEnvironment({ ...safeEnvironment, TEST_DATABASE_URL: '' }),
    /TEST_DATABASE_URL/
  )
  assert.throws(
    () => assertCiRequiredEnvironment({ ...safeEnvironment, ALLOW_E2E_DATABASE_WRITES: '0' }),
    /ALLOW_E2E_DATABASE_WRITES=1/
  )
})

test('ci:required stops at the first failed injected stage without reporting later stages', async () => {
  const executed = []
  const reported = []

  await assert.rejects(
    runRequiredCiGate({
      environment: safeEnvironment,
      stages: [
        { id: 'build', label: 'Build', npmArguments: [] },
        { id: 'lint', label: 'Lint', npmArguments: [] },
        { id: 'test', label: 'Test', npmArguments: [] },
      ],
      executeStage: async (stage) => {
        executed.push(stage.id)
        return stage.id === 'lint' ? 1 : 0
      },
      write: (message) => reported.push(message),
    }),
    /stage lint failed with exit code 1/
  )

  assert.deepEqual(executed, ['build', 'lint'])
  assert.deepEqual(reported, ['\n==> Build\n', '\n==> Lint\n'])
})

test('CI installs Chromium before delegating required verification to the shared gate', async () => {
  const workflow = await readFile(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8')

  assert.match(
    workflow,
    /Install Chromium\n\s+run: npx playwright install --with-deps chromium\n\n\s+- name: Run required fresh verification gate\n\s+run: npm run ci:required/
  )
})
