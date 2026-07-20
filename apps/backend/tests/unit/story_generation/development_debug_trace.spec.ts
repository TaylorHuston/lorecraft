import {
  createDevelopmentDebugTrace,
  debugTraceDirectory,
  resolveDevelopmentDebugTraceOptions,
} from '#services/story_generation/development_debug_trace'
import { test } from '@japa/runner'
import { readdir, readFile, stat, unlink, utimes, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

test.group('DevelopmentDebugTrace', () => {
  test('LC-003/S2/R3-S6: defaults local capture on, permits explicit disablement, and refuses production capture', async ({
    assert,
  }) => {
    assert.deepEqual(resolveDevelopmentDebugTraceOptions({ nodeEnv: 'development' }), {
      nodeEnv: 'development',
      enabled: true,
      captureRawRequest: true,
      captureRawResponse: true,
    })
    assert.deepEqual(
      resolveDevelopmentDebugTraceOptions({
        nodeEnv: 'development',
        enabled: false,
        captureRawRequest: false,
        captureRawResponse: false,
      }),
      {
        nodeEnv: 'development',
        enabled: false,
        captureRawRequest: false,
        captureRawResponse: false,
      }
    )
    assert.isNull(
      createDevelopmentDebugTrace({
        nodeEnv: 'development',
        enabled: false,
        captureRawRequest: false,
        captureRawResponse: false,
      })
    )
    assert.throws(
      () =>
        createDevelopmentDebugTrace({
          nodeEnv: 'production',
          enabled: true,
          captureRawRequest: false,
          captureRawResponse: false,
        }),
      /cannot run in production/
    )
  })

  test('LC-003/S2/R3-S6: writes owner-only JSONL under the controlled temporary directory and independently gates raw payloads', async ({
    assert,
  }) => {
    const now = new Date('2026-07-19T12:00:00.000Z')
    const trace = createDevelopmentDebugTrace({
      nodeEnv: 'development',
      enabled: true,
      captureRawRequest: true,
      captureRawResponse: false,
      now: () => now,
    })!
    const fileName = `trace-${now.toISOString().slice(0, 10)}.jsonl`
    const filePath = join(debugTraceDirectory, fileName)

    await trace.capture({
      traceId: 'trace-1',
      operation: 'turn_narration_generation',
      stage: 'provider',
      rawRequest: {
        headers: { authorization: 'Bearer secret-token', cookie: 'session=secret' },
        body: '{"apiKey":"secret-key"}',
      },
      rawResponse: '{"authorization":"secret-response"}',
    })

    const contents = await readFile(filePath, 'utf8')
    const [line] = contents.trim().split('\n')
    const record = JSON.parse(line) as Record<string, unknown>
    assert.property(record, 'rawRequest')
    assert.notProperty(record, 'rawResponse')
    assert.notInclude(JSON.stringify(record), 'secret-token')
    assert.notInclude(JSON.stringify(record), 'secret-key')
    assert.notInclude(JSON.stringify(record), 'session=secret')
    const directoryMetadata = await stat(debugTraceDirectory)
    const fileMetadata = await stat(filePath)
    assert.equal(directoryMetadata.mode & 0o777, 0o700)
    assert.equal(fileMetadata.mode & 0o777, 0o600)

    await unlink(filePath)
  })

  test('LC-003/S2/R3-S6: purges trace files older than seven days', async ({ assert }) => {
    const now = new Date('2026-07-19T12:00:00.000Z')
    const staleFile = join(debugTraceDirectory, 'trace-2026-07-11.jsonl')
    const trace = createDevelopmentDebugTrace({
      nodeEnv: 'development',
      enabled: true,
      captureRawRequest: false,
      captureRawResponse: false,
      now: () => now,
    })!

    await trace.capture({ traceId: 'trace-2', operation: 'opening_generation', stage: 'input' })
    await writeFile(staleFile, '{"stale":true}\n', { mode: 0o600 })
    await utimes(
      staleFile,
      new Date('2026-07-11T00:00:00.000Z'),
      new Date('2026-07-11T00:00:00.000Z')
    )
    await trace.capture({ traceId: 'trace-3', operation: 'opening_generation', stage: 'outcome' })

    assert.notInclude(await readdir(debugTraceDirectory), 'trace-2026-07-11.jsonl')
    const currentFile = join(debugTraceDirectory, 'trace-2026-07-19.jsonl')
    await unlink(currentFile)
  })
})
