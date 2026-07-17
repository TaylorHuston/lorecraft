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
}

class RequestTimeoutError extends Error {}

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

        return { response: providerResponse, rawResponse: await providerResponse.text() }
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
