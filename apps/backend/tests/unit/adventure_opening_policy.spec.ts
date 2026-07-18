import { retryDelayMs, retryDisposition } from '#services/adventure_opening_policy'
import { test } from '@japa/runner'

test.group('Adventure opening policy', () => {
  test('LC-003/S1/R3: retries only transient provider failures', ({ assert }) => {
    assert.equal(retryDisposition('timeout'), 'retry')
    assert.equal(retryDisposition('provider_failure'), 'retry')
    assert.equal(retryDisposition('provider_failure', 408), 'retry')
    assert.equal(retryDisposition('provider_failure', 429), 'retry')
    assert.equal(retryDisposition('provider_failure', 503), 'retry')
    assert.equal(retryDisposition('provider_failure', 400), 'terminal')
    assert.equal(retryDisposition('provider_failure', 401), 'terminal')
    assert.equal(retryDisposition('provider_failure', 403), 'terminal')
    assert.equal(retryDisposition('malformed_response'), 'terminal')
    assert.equal(retryDisposition('empty_narration'), 'terminal')
    assert.equal(retryDisposition('cancelled'), 'terminal')
  })

  test('LC-003/S1/R3: applies deterministic capped backoff and bounded provider guidance', ({
    assert,
  }) => {
    assert.equal(retryDelayMs({ attempt: 1, baseDelayMs: 1_000, jitter: 0 }), 500)
    assert.equal(retryDelayMs({ attempt: 2, baseDelayMs: 1_000, jitter: 1 }), 2_000)
    assert.equal(
      retryDelayMs({ attempt: 2, baseDelayMs: 1_000, jitter: 0.5, retryAfterMs: 120_000 }),
      60_000
    )
  })
})
