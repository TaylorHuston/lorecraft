import AdventureOpeningWorker, {
  leaseDurationForProviderTimeout,
} from '#services/adventure_opening_worker'
import { OpenAICompatibleStoryGenerator } from '#services/story_generation/openai_compatible_story_generator'
import { BaseCommand } from '@adonisjs/core/ace'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import { hostname } from 'node:os'
import { randomUUID } from 'node:crypto'

const defaultPollIntervalMs = 1_000
const defaultTimeoutMs = 120_000
const defaultMaxTokens = 500
const defaultTemperature = 0.8

function positiveNumber(value: number | undefined, fallback: number, name: string) {
  const resolved = value ?? fallback
  if (!Number.isFinite(resolved) || resolved <= 0) {
    throw new Error(`${name} must be a positive number.`)
  }
  return resolved
}

function waitForNextPoll(delayMs: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    if (signal.aborted) {
      resolve()
      return
    }

    const onAbort = () => {
      clearTimeout(timeout)
      resolve()
    }
    const timeout = setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, delayMs)
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

export default class WorkAdventureOpenings extends BaseCommand {
  static commandName = 'adventures:openings:work'
  static description = 'Process durable Adventure opening jobs'
  static options = {
    startApp: true,
    staysAlive: true,
  }

  async run() {
    const baseUrl = env.get('LLM_BASE_URL')?.trim()
    const model = env.get('LLM_MODEL')?.trim()
    if (!baseUrl || !model) {
      this.logger.error('LLM_BASE_URL and LLM_MODEL are required to run the Adventure worker.')
      this.exitCode = 1
      return
    }

    const pollIntervalMs = positiveNumber(
      env.get('ADVENTURE_WORKER_POLL_INTERVAL_MS'),
      defaultPollIntervalMs,
      'ADVENTURE_WORKER_POLL_INTERVAL_MS'
    )
    const timeoutMs = positiveNumber(env.get('LLM_TIMEOUT_MS'), defaultTimeoutMs, 'LLM_TIMEOUT_MS')
    const maxTokens = positiveNumber(env.get('LLM_MAX_TOKENS'), defaultMaxTokens, 'LLM_MAX_TOKENS')
    const temperature = env.get('LLM_TEMPERATURE') ?? defaultTemperature
    if (!Number.isFinite(temperature) || temperature < 0 || temperature > 2) {
      throw new Error('LLM_TEMPERATURE must be between 0 and 2.')
    }

    const workerId = `${hostname()}:${process.pid}:${randomUUID()}`
    const worker = new AdventureOpeningWorker({
      generator: new OpenAICompatibleStoryGenerator({
        fetch,
        baseUrl,
        apiKey: env.get('LLM_API_KEY') ?? 'local-provider',
        model,
        settings: {
          temperature,
          maxTokens,
          reasoningEffort: env.get('LLM_REASONING_EFFORT'),
        },
        timeoutMs,
      }),
      workerId,
      leaseDurationMs: leaseDurationForProviderTimeout(timeoutMs),
      logger: {
        info(event, fields) {
          logger.info(fields, event)
        },
      },
    })
    const shutdown = new AbortController()
    const stop = () => shutdown.abort()
    process.once('SIGINT', stop)
    process.once('SIGTERM', stop)
    logger.info({ workerId, model, pollIntervalMs }, 'adventure_opening.worker_started')

    try {
      while (!shutdown.signal.aborted) {
        const result = await worker.runOnce(shutdown.signal)
        if (result.status === 'idle') {
          await waitForNextPoll(pollIntervalMs, shutdown.signal)
        }
      }
    } finally {
      process.off('SIGINT', stop)
      process.off('SIGTERM', stop)
      logger.info({ workerId }, 'adventure_opening.worker_stopped')
    }
  }
}
