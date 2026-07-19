import AdventureTurnProductionCompletionPort from '#services/adventure_turn_production_completion_port'
import AdventureTurnWorker from '#services/adventure_turn_worker'
import { OpenAICompatibleAdventureStateExtractor } from '#services/story_generation/openai_compatible_adventure_state_extractor'
import { OpenAICompatibleStoryGenerator } from '#services/story_generation/openai_compatible_story_generator'
import { BaseCommand } from '@adonisjs/core/ace'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import { randomUUID } from 'node:crypto'
import { hostname } from 'node:os'

const defaultPollIntervalMs = 1_000
const defaultTimeoutMs = 120_000
const defaultMaxTokens = 500
const defaultTemperature = 0.8

function positiveNumber(value: number | undefined, fallback: number, name: string) {
  const resolved = value ?? fallback
  if (!Number.isFinite(resolved) || resolved <= 0)
    throw new Error(`${name} must be a positive number.`)
  return resolved
}

function waitForNextPoll(delayMs: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    if (signal.aborted) return resolve()
    const timeout = setTimeout(resolve, delayMs)
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timeout)
        resolve()
      },
      { once: true }
    )
  })
}

export default class WorkAdventureTurns extends BaseCommand {
  static commandName = 'adventures:turns:work'
  static description = 'Process durable Adventure turn jobs'
  static options = { startApp: true, staysAlive: true }

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

    const storyGenerator = new OpenAICompatibleStoryGenerator({
      fetch,
      baseUrl,
      apiKey: env.get('LLM_API_KEY') ?? 'local-provider',
      model,
      settings: { temperature, maxTokens, reasoningEffort: env.get('LLM_REASONING_EFFORT') },
      timeoutMs,
    })
    const workerId = `${hostname()}:${process.pid}:${randomUUID()}`
    const worker = new AdventureTurnWorker({
      completion: new AdventureTurnProductionCompletionPort({
        storyGenerator,
        stateExtractor: new OpenAICompatibleAdventureStateExtractor(storyGenerator),
      }),
      workerId,
      leaseDurationMs: timeoutMs * 2 + 30_000,
    })
    const shutdown = new AbortController()
    const stop = () => shutdown.abort()
    process.once('SIGINT', stop)
    process.once('SIGTERM', stop)
    logger.info({ workerId, model, pollIntervalMs }, 'adventure_turn.worker_started')
    try {
      while (!shutdown.signal.aborted) {
        const result = await worker.runOnce(shutdown.signal)
        if (result.status === 'idle') await waitForNextPoll(pollIntervalMs, shutdown.signal)
      }
    } finally {
      process.off('SIGINT', stop)
      process.off('SIGTERM', stop)
      logger.info({ workerId }, 'adventure_turn.worker_stopped')
    }
  }
}
