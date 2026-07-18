import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const workflowPath = new URL('../.github/workflows/images.yml', import.meta.url)

test('production image workflow builds pull requests and publishes immutable explicit refs', async () => {
  const workflow = await readFile(workflowPath, 'utf8')

  assert.match(workflow, /pull_request:/)
  assert.match(workflow, /workflow_dispatch:/)
  assert.match(workflow, /branches:\s*\n\s*- main/)
  assert.match(workflow, /packages: write/)
  assert.match(workflow, /docker\/setup-buildx-action@v4/)
  assert.match(workflow, /docker\/login-action@v3/)
  assert.match(workflow, /docker\/build-push-action@v7/)
  assert.match(workflow, /apps\/backend\/Dockerfile/)
  assert.match(workflow, /apps\/frontend\/Dockerfile/)
  assert.match(
    workflow,
    /push: \$\{\{ github\.event_name != 'pull_request' && github\.ref == 'refs\/heads\/main' \}\}/
  )
  assert.match(workflow, /tags: \$\{\{ steps\.image\.outputs\.name \}\}:\$\{\{ github\.sha \}\}/)
  assert.doesNotMatch(workflow, /:latest/)
})
