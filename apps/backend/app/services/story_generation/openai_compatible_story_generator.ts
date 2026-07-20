import type {
  OpeningStoryInput,
  StoryGenerationEvidence,
  StoryGenerationDebugContext,
  StoryGenerationResult,
  StoryGenerationSettings,
  StoryGenerator,
} from './story_generator.js'
import { StoryGenerationError } from './story_generator.js'
import { assembleOpeningPrompt } from './opening_prompt.js'
import type { TurnStoryGenerator, TurnStoryInput } from './turn_story_generator.js'
import { assembleTurnPrompt } from './turn_prompt.js'

export type StoryGenerationFetch = (
  input: string | URL | Request,
  init?: RequestInit
) => Promise<Response>

export type OpenAICompatibleStoryGeneratorConfig = {
  fetch: StoryGenerationFetch
  baseUrl: string
  apiKey: string
  model: string
  provider?: string
  settings: StoryGenerationSettings
  timeoutMs: number
  maxResponseBytes?: number
}

class RequestTimeoutError extends Error {}
class ResponseTooLargeError extends Error {}

const defaultMaxResponseBytes = 1_000_000
const maximumRetryAfterMs = 60_000
const knownFinishReasons = new Set(['stop', 'length', 'tool_calls', 'content_filter'])

export function parseRetryAfter(value: string | null, nowMs = Date.now()) {
  if (!value) return undefined
  const trimmed = value.trim()
  const seconds = Number(trimmed)
  const delayMs =
    trimmed !== '' && Number.isFinite(seconds) && seconds >= 0
      ? seconds * 1_000
      : Date.parse(trimmed) - nowMs

  if (!Number.isFinite(delayMs) || delayMs < 0) return undefined
  return Math.min(Math.round(delayMs), maximumRetryAfterMs)
}

async function readBoundedResponse(response: Response, maxBytes: number) {
  const contentLength = Number(response.headers.get('content-length'))
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    await response.body?.cancel()
    throw new ResponseTooLargeError()
  }

  if (!response.body) return ''

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let received = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      received += value.byteLength
      if (received > maxBytes) {
        await reader.cancel()
        throw new ResponseTooLargeError()
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }

  const combined = new Uint8Array(received)
  let offset = 0
  for (const chunk of chunks) {
    combined.set(chunk, offset)
    offset += chunk.byteLength
  }
  return new TextDecoder().decode(combined)
}

function parsedResponseFrom(rawResponse: string, evidence: StoryGenerationEvidence) {
  let parsed: unknown

  try {
    parsed = JSON.parse(rawResponse)
  } catch {
    throw new StoryGenerationError(
      'malformed_response',
      'Story provider returned a malformed response',
      evidence
    )
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('choices' in parsed) ||
    !Array.isArray(parsed.choices) ||
    typeof parsed.choices[0] !== 'object' ||
    parsed.choices[0] === null ||
    !('message' in parsed.choices[0]) ||
    typeof parsed.choices[0].message !== 'object' ||
    parsed.choices[0].message === null ||
    !('content' in parsed.choices[0].message) ||
    typeof parsed.choices[0].message.content !== 'string'
  ) {
    throw new StoryGenerationError(
      'malformed_response',
      'Story provider returned a malformed response',
      evidence
    )
  }

  if ('finish_reason' in parsed.choices[0] && parsed.choices[0].finish_reason === 'length') {
    throw new StoryGenerationError(
      'malformed_response',
      'Story provider returned truncated narration',
      evidence
    )
  }

  const narration = parsed.choices[0].message.content.trim()

  if (!narration) {
    throw new StoryGenerationError(
      'empty_narration',
      'Story provider returned empty narration',
      evidence
    )
  }

  const usage =
    'usage' in parsed && typeof parsed.usage === 'object' && parsed.usage !== null
      ? parsed.usage
      : null
  return {
    narration,
    finishReason:
      'finish_reason' in parsed.choices[0] &&
      typeof parsed.choices[0].finish_reason === 'string' &&
      knownFinishReasons.has(parsed.choices[0].finish_reason)
        ? parsed.choices[0].finish_reason
        : undefined,
    promptTokens:
      usage && 'prompt_tokens' in usage && typeof usage.prompt_tokens === 'number'
        ? usage.prompt_tokens
        : undefined,
    completionTokens:
      usage && 'completion_tokens' in usage && typeof usage.completion_tokens === 'number'
        ? usage.completion_tokens
        : undefined,
  }
}

export class OpenAICompatibleStoryGenerator implements StoryGenerator, TurnStoryGenerator {
  constructor(private readonly config: OpenAICompatibleStoryGeneratorConfig) {}

  /** Shared transport primitive for a separately-owned structured operation. */
  async generatePrompt(
    prompt: { system: string; user: string },
    signal?: AbortSignal,
    debug?: StoryGenerationDebugContext
  ): Promise<StoryGenerationResult> {
    return this.#generate(prompt, signal, debug)
  }

  async generateOpening(
    input: OpeningStoryInput,
    signal?: AbortSignal,
    debug?: StoryGenerationDebugContext
  ): Promise<StoryGenerationResult> {
    return this.generatePrompt(assembleOpeningPrompt(input), signal, debug)
  }

  async generateTurn(
    input: TurnStoryInput,
    signal?: AbortSignal,
    debug?: StoryGenerationDebugContext
  ): Promise<StoryGenerationResult> {
    return this.generatePrompt(assembleTurnPrompt(input), signal, debug)
  }

  async #generate(
    prompt: { system: string; user: string },
    signal?: AbortSignal,
    debug?: StoryGenerationDebugContext
  ): Promise<StoryGenerationResult> {
    const url = `${this.config.baseUrl.replace(/\/$/, '')}/chat/completions`
    const body = {
      model: this.config.model,
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ],
      temperature: this.config.settings.temperature,
      max_tokens: this.config.settings.maxTokens,
      ...(this.config.settings.topP === undefined ? {} : { top_p: this.config.settings.topP }),
      ...(this.config.settings.reasoningEffort === undefined
        ? {}
        : { reasoning_effort: this.config.settings.reasoningEffort }),
    }
    const serializedBody = JSON.stringify(body)
    const pendingEvidence: StoryGenerationEvidence = {
      provider: this.config.provider ?? 'openai-compatible',
      model: this.config.model,
      settings: { ...this.config.settings },
      request: {
        byteCount: Buffer.byteLength(serializedBody, 'utf8'),
        timeoutMs: this.config.timeoutMs,
      },
      response: { byteCount: 0, statusCode: null },
    }
    let response: Response
    let rawResponse: string
    const abortController = new AbortController()
    const cancel = () => abortController.abort()
    signal?.addEventListener('abort', cancel, { once: true })
    let timeout: ReturnType<typeof setTimeout> | undefined
    const maxResponseBytes = this.config.maxResponseBytes ?? defaultMaxResponseBytes

    if (!Number.isFinite(maxResponseBytes) || maxResponseBytes <= 0) {
      throw new Error('Story provider response limit must be positive.')
    }

    if (signal?.aborted) {
      throw new StoryGenerationError(
        'cancelled',
        'Story provider request was cancelled',
        pendingEvidence
      )
    }

    try {
      const request = async () => {
        const providerResponse = await this.config.fetch(url, {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'authorization': `Bearer ${this.config.apiKey}`,
            'content-type': 'application/json',
          },
          body: serializedBody,
          signal: abortController.signal,
        })

        return {
          response: providerResponse,
          rawResponse: await readBoundedResponse(providerResponse, maxResponseBytes),
        }
      }
      const timeoutReached = new Promise<never>((_resolve, reject) => {
        timeout = setTimeout(() => {
          abortController.abort()
          reject(new RequestTimeoutError())
        }, this.config.timeoutMs)
      })

      ;({ response, rawResponse } = await Promise.race([request(), timeoutReached]))
    } catch (error) {
      if (signal?.aborted) {
        throw new StoryGenerationError(
          'cancelled',
          'Story provider request was cancelled',
          pendingEvidence
        )
      }
      if (error instanceof RequestTimeoutError) {
        throw new StoryGenerationError(
          'timeout',
          'Story provider request timed out',
          pendingEvidence
        )
      }

      if (error instanceof ResponseTooLargeError) {
        throw new StoryGenerationError(
          'malformed_response',
          'Story provider response exceeded the allowed size',
          pendingEvidence
        )
      }

      throw new StoryGenerationError(
        'provider_failure',
        'Story provider request failed',
        pendingEvidence
      )
    } finally {
      clearTimeout(timeout)
      signal?.removeEventListener('abort', cancel)
    }

    const retryAfterMs = parseRetryAfter(response.headers.get('retry-after'))
    const evidence: StoryGenerationEvidence = {
      ...pendingEvidence,
      response: {
        byteCount: Buffer.byteLength(rawResponse, 'utf8'),
        statusCode: response.status,
        ...(retryAfterMs === undefined ? {} : { retryAfterMs }),
      },
    }
    await debug?.trace.capture({
      traceId: debug.traceId,
      operation: debug.operation,
      stage: 'provider',
      adventureId: debug.adventureId,
      jobId: debug.jobId,
      turnId: debug.turnId,
      provider: pendingEvidence.provider,
      model: pendingEvidence.model,
      promptSummary: {
        systemCharacters: prompt.system.length,
        userCharacters: prompt.user.length,
      },
      promptByteCount: Buffer.byteLength(`${prompt.system}\n${prompt.user}`, 'utf8'),
      rawRequest: {
        headers: {
          'accept': 'application/json',
          'authorization': `Bearer ${this.config.apiKey}`,
          'content-type': 'application/json',
        },
        body: serializedBody,
      },
      rawResponse,
      status: response.ok ? 'succeeded' : 'failed',
    })

    if (!response.ok) {
      throw new StoryGenerationError(
        'provider_failure',
        'Story provider request failed',
        evidence,
        response.status
      )
    }

    const parsed = parsedResponseFrom(rawResponse, evidence)

    return {
      narration: parsed.narration,
      ...evidence,
      response: {
        ...evidence.response,
        ...(parsed.finishReason === undefined ? {} : { finishReason: parsed.finishReason }),
        ...(parsed.promptTokens === undefined ? {} : { promptTokens: parsed.promptTokens }),
        ...(parsed.completionTokens === undefined
          ? {}
          : { completionTokens: parsed.completionTokens }),
      },
    }
  }
}
