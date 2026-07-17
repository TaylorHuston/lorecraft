import type {
  OpeningStoryInput,
  SanitizedStoryGenerationRequest,
  StoryGenerationEvidence,
  StoryGenerationResult,
  StoryGenerationSettings,
  StoryGenerator,
} from './story_generator.js'
import { StoryGenerationError } from './story_generator.js'
import { assembleOpeningPrompt } from './opening_prompt.js'

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

function narrationFrom(rawResponse: string, evidence: StoryGenerationEvidence): string {
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

  return narration
}

export class OpenAICompatibleStoryGenerator implements StoryGenerator {
  constructor(private readonly config: OpenAICompatibleStoryGeneratorConfig) {}

  async generateOpening(input: OpeningStoryInput): Promise<StoryGenerationResult> {
    const url = `${this.config.baseUrl.replace(/\/$/, '')}/chat/completions`
    const prompt = assembleOpeningPrompt(input)
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
    const redactedRequest: SanitizedStoryGenerationRequest = {
      method: 'POST',
      url,
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
      },
      body,
      timeoutMs: this.config.timeoutMs,
    }
    const pendingEvidence: StoryGenerationEvidence = {
      provider: this.config.provider ?? 'openai-compatible',
      model: this.config.model,
      settings: { ...this.config.settings },
      redactedRequest,
      rawResponse: null,
    }
    let response: Response
    let rawResponse: string
    const abortController = new AbortController()
    let timeout: ReturnType<typeof setTimeout> | undefined
    const maxResponseBytes = this.config.maxResponseBytes ?? defaultMaxResponseBytes

    if (!Number.isFinite(maxResponseBytes) || maxResponseBytes <= 0) {
      throw new Error('Story provider response limit must be positive.')
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
          body: JSON.stringify(body),
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
    }

    const evidence: StoryGenerationEvidence = {
      ...pendingEvidence,
      rawResponse,
    }

    if (!response.ok) {
      throw new StoryGenerationError(
        'provider_failure',
        'Story provider request failed',
        evidence,
        response.status
      )
    }

    const narration = narrationFrom(rawResponse, evidence)

    return {
      narration,
      ...evidence,
      rawResponse,
    }
  }
}
