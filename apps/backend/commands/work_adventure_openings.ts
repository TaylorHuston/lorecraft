import AdventureOpeningWorker, {
  leaseDurationForProviderTimeout,
} from '#services/adventure_opening_worker'
import { OpenAICompatibleStoryGenerator } from '#services/story_generation/openai_compatible_story_generator'
import { resolveStoryGenerationRuntimeConfiguration } from '#services/story_generation/runtime_configuration'
import {
  createDevelopmentDebugTrace,
  resolveDevelopmentDebugTraceOptions,
} from '#services/story_generation/development_debug_trace'
import { BaseCommand } from '@adonisjs/core/ace'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import { hostname } from 'node:os'
import { randomUUID } from 'node:crypto'

const defaultPollIntervalMs = 1_000

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
    const configuration = resolveStoryGenerationRuntimeConfiguration({
      LLM_BASE_URL: env.get('LLM_BASE_URL'),
      LLM_MODEL: env.get('LLM_MODEL'),
      LLM_TIMEOUT_MS: env.get('LLM_TIMEOUT_MS'),
      LLM_MAX_TOKENS: env.get('LLM_MAX_TOKENS'),
      LLM_TEMPERATURE: env.get('LLM_TEMPERATURE'),
      LLM_REASONING_EFFORT: env.get('LLM_REASONING_EFFORT'),
    })
    const pollIntervalMs = positiveNumber(
      env.get('ADVENTURE_WORKER_POLL_INTERVAL_MS'),
      defaultPollIntervalMs,
      'ADVENTURE_WORKER_POLL_INTERVAL_MS'
    )
    const workerId = `${hostname()}:${process.pid}:${randomUUID()}`
    const debugTrace = createDevelopmentDebugTrace(
      resolveDevelopmentDebugTraceOptions({
        nodeEnv: env.get('NODE_ENV'),
        enabled: env.get('LORECRAFT_DEBUG_TRACE'),
        captureRawRequest: env.get('LORECRAFT_DEBUG_TRACE_RAW_REQUEST'),
        captureRawResponse: env.get('LORECRAFT_DEBUG_TRACE_RAW_RESPONSE'),
      })
    )
    const worker = new AdventureOpeningWorker({
      generator: new OpenAICompatibleStoryGenerator({
        fetch,
        baseUrl: configuration.baseUrl,
        apiKey: env.get('LLM_API_KEY') ?? 'local-provider',
        model: configuration.model,
        settings: configuration.settings,
        timeoutMs: configuration.timeoutMs,
      }),
      workerId,
      debugTrace,
      leaseDurationMs: leaseDurationForProviderTimeout(configuration.timeoutMs),
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
    logger.info(
      {
        workerId,
        model: configuration.model,
        maxTokens: configuration.settings.maxTokens,
        timeoutMs: configuration.timeoutMs,
        pollIntervalMs,
      },
      'adventure_opening.worker_started'
    )

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
