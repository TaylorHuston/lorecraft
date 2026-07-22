import type { StoryGenerationSettings } from './story_generator.js'

export const defaultStoryGenerationTimeoutMs = 120_000
export const defaultStoryGenerationMaxTokens = 500
export const defaultStoryGenerationTemperature = 0.8

export type StoryGenerationRuntimeEnvironment = {
  LLM_BASE_URL?: string
  LLM_MODEL?: string
  LLM_TIMEOUT_MS?: number
  LLM_MAX_TOKENS?: number
  LLM_TEMPERATURE?: number
  LLM_REASONING_EFFORT?: StoryGenerationSettings['reasoningEffort']
}

export type StoryGenerationRuntimeConfiguration = {
  baseUrl: string
  model: string
  timeoutMs: number
  settings: StoryGenerationSettings
}

function positiveNumber(value: number | undefined, fallback: number, name: string) {
  const resolved = value ?? fallback
  if (!Number.isFinite(resolved) || resolved <= 0) {
    throw new Error(`${name} must be a positive number.`)
  }
  return resolved
}

/** Resolves the one provider configuration shared by workers and live smoke checks. */
export function resolveStoryGenerationRuntimeConfiguration(
  environment: StoryGenerationRuntimeEnvironment
): StoryGenerationRuntimeConfiguration {
  const baseUrl = environment.LLM_BASE_URL?.trim()
  const model = environment.LLM_MODEL?.trim()
  if (!baseUrl || !model) {
    throw new Error('LLM_BASE_URL and LLM_MODEL are required to run Adventure generation.')
  }

  const timeoutMs = positiveNumber(
    environment.LLM_TIMEOUT_MS,
    defaultStoryGenerationTimeoutMs,
    'LLM_TIMEOUT_MS'
  )
  const maxTokens = positiveNumber(
    environment.LLM_MAX_TOKENS,
    defaultStoryGenerationMaxTokens,
    'LLM_MAX_TOKENS'
  )
  const temperature = environment.LLM_TEMPERATURE ?? defaultStoryGenerationTemperature
  if (!Number.isFinite(temperature) || temperature < 0 || temperature > 2) {
    throw new Error('LLM_TEMPERATURE must be between 0 and 2.')
  }

  return {
    baseUrl,
    model,
    timeoutMs,
    settings: {
      temperature,
      maxTokens,
      reasoningEffort: environment.LLM_REASONING_EFFORT,
    },
  }
}
