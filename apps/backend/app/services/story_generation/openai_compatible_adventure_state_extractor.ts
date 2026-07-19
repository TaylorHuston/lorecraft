import {
  AdventureStateExtractionError,
  parseAdventureStateExtraction,
  type AdventureStateExtractionInput,
  type AdventureStateExtractionResult,
  type AdventureStateExtractor,
} from './adventure_state_extractor.js'
import { assembleAdventureStateExtractionPrompt } from './adventure_state_extraction_prompt.js'
import { StoryGenerationError, type StoryGenerationResult } from './story_generator.js'

/**
 * Keeps structured extraction on its own application contract while allowing the
 * configured OpenAI-compatible transport to be shared with narration generation.
 */
export class OpenAICompatibleAdventureStateExtractor implements AdventureStateExtractor {
  constructor(
    private readonly transport: {
      generatePrompt(
        prompt: { system: string; user: string },
        signal?: AbortSignal
      ): Promise<StoryGenerationResult>
    }
  ) {}

  async extract(
    input: AdventureStateExtractionInput,
    signal?: AbortSignal
  ): Promise<AdventureStateExtractionResult> {
    try {
      const result = await this.transport.generatePrompt(
        assembleAdventureStateExtractionPrompt(input),
        signal
      )
      return {
        provider: result.provider,
        model: result.model,
        settings: result.settings,
        request: result.request,
        response: result.response,
        extraction: parseAdventureStateExtraction(result.narration),
      }
    } catch (error) {
      if (error instanceof AdventureStateExtractionError) throw error
      if (error instanceof StoryGenerationError) {
        const code = error.code === 'cancelled' ? 'cancelled' : error.code
        throw new AdventureStateExtractionError(
          code === 'empty_narration' ? 'malformed_response' : code,
          `Adventure state extraction failed: ${code}.`,
          error.evidence,
          error.providerStatus
        )
      }
      throw new AdventureStateExtractionError(
        'provider_failure',
        'Adventure state extraction failed: provider_failure.'
      )
    }
  }
}
