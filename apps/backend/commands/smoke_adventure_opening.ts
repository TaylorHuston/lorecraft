import { generateOpeningSmoke } from '#services/story_generation/opening_smoke'
import { OpenAICompatibleStoryGenerator } from '#services/story_generation/openai_compatible_story_generator'
import { resolveStoryGenerationRuntimeConfiguration } from '#services/story_generation/runtime_configuration'
import { StoryGenerationError } from '#services/story_generation/story_generator'
import { BaseCommand } from '@adonisjs/core/ace'
import logger from '@adonisjs/core/services/logger'
import env from '#start/env'

/** Makes one synthetic opening request to validate the active local provider configuration. */
export default class SmokeAdventureOpening extends BaseCommand {
  static commandName = 'adventures:openings:smoke'
  static description =
    'Verify the configured provider can complete a representative Adventure opening'
  static options = { startApp: true }

  async run() {
    const configuration = resolveStoryGenerationRuntimeConfiguration({
      LLM_BASE_URL: env.get('LLM_BASE_URL'),
      LLM_MODEL: env.get('LLM_MODEL'),
      LLM_TIMEOUT_MS: env.get('LLM_TIMEOUT_MS'),
      LLM_MAX_TOKENS: env.get('LLM_MAX_TOKENS'),
      LLM_TEMPERATURE: env.get('LLM_TEMPERATURE'),
      LLM_REASONING_EFFORT: env.get('LLM_REASONING_EFFORT'),
    })
    const generator = new OpenAICompatibleStoryGenerator({
      fetch,
      baseUrl: configuration.baseUrl,
      apiKey: env.get('LLM_API_KEY') ?? 'local-provider',
      model: configuration.model,
      settings: configuration.settings,
      timeoutMs: configuration.timeoutMs,
    })

    try {
      const result = await generateOpeningSmoke(generator)
      logger.info(
        {
          model: configuration.model,
          maxTokens: configuration.settings.maxTokens,
          timeoutMs: configuration.timeoutMs,
          response: result.response,
        },
        'adventure_opening.smoke_passed'
      )
    } catch (error) {
      const generationError = error instanceof StoryGenerationError ? error : undefined
      logger.error(
        {
          model: configuration.model,
          maxTokens: configuration.settings.maxTokens,
          timeoutMs: configuration.timeoutMs,
          failureCode: generationError?.code ?? 'unexpected_error',
          providerStatus: generationError?.providerStatus,
        },
        'adventure_opening.smoke_failed'
      )
      this.exitCode = 1
    }
  }
}
