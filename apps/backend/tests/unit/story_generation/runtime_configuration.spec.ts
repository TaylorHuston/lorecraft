import { test } from '@japa/runner'
import {
  defaultStoryGenerationMaxTokens,
  resolveStoryGenerationRuntimeConfiguration,
} from '#services/story_generation/runtime_configuration'

test.group('Story generation runtime configuration', () => {
  test('uses one bounded default token cap for worker and smoke configuration', ({ assert }) => {
    const configuration = resolveStoryGenerationRuntimeConfiguration({
      LLM_BASE_URL: 'http://provider.example.test/v1',
      LLM_MODEL: 'story-model',
    })

    assert.equal(configuration.settings.maxTokens, defaultStoryGenerationMaxTokens)
    assert.equal(defaultStoryGenerationMaxTokens, 500)
    assert.equal(configuration.model, 'story-model')
  })

  test('rejects an invalid effective token cap before a provider request', ({ assert }) => {
    assert.throws(
      () =>
        resolveStoryGenerationRuntimeConfiguration({
          LLM_BASE_URL: 'http://provider.example.test/v1',
          LLM_MODEL: 'story-model',
          LLM_MAX_TOKENS: 0,
        }),
      'LLM_MAX_TOKENS must be a positive number.'
    )
  })
})
