import type { StoryGenerationErrorCode } from '#services/story_generation/story_generator'

const maximumRetryDelayMs = 60_000

export function retryDisposition(code: StoryGenerationErrorCode, providerStatus?: number) {
  if (code === 'timeout') return 'retry'
  if (code !== 'provider_failure') return 'terminal'
  if (providerStatus === undefined) return 'retry'
  return providerStatus === 408 || providerStatus === 429 || providerStatus >= 500
    ? 'retry'
    : 'terminal'
}

export function retryDelayMs(options: {
  attempt: number
  baseDelayMs: number
  jitter: number
  retryAfterMs?: number
}) {
  const guided = options.retryAfterMs
  if (guided !== undefined && Number.isFinite(guided) && guided >= 0) {
    return Math.min(guided, maximumRetryDelayMs)
  }

  const boundedJitter = Math.min(1, Math.max(0, options.jitter))
  const exponential = options.baseDelayMs * 2 ** Math.max(0, options.attempt - 1)
  return Math.min(Math.round(exponential * (0.5 + boundedJitter * 0.5)), maximumRetryDelayMs)
}
