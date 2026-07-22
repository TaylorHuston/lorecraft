import { test } from '@japa/runner'
import { generateOpeningSmoke, openingSmokeInput } from '#services/story_generation/opening_smoke'
import { OpenAICompatibleStoryGenerator } from '#services/story_generation/openai_compatible_story_generator'
import { StoryGenerationError } from '#services/story_generation/story_generator'

test.group('Opening provider smoke', () => {
  test('uses bounded synthetic current-Scene context and accepts a complete response', async ({
    assert,
  }) => {
    let requestBody: Record<string, unknown> | undefined
    const generator = new OpenAICompatibleStoryGenerator({
      fetch: async (_input, init) => {
        requestBody = JSON.parse(String(init?.body))
        return new Response(
          JSON.stringify({
            choices: [{ finish_reason: 'stop', message: { content: 'Complete.' } }],
          }),
          { status: 200 }
        )
      },
      baseUrl: 'https://provider.example.test/v1',
      apiKey: 'test-secret',
      model: 'story-model',
      settings: { temperature: 0.8, maxTokens: 500 },
      timeoutMs: 100,
    })

    const result = await generateOpeningSmoke(generator)

    assert.equal(result.narration, 'Complete.')
    assert.equal(openingSmokeInput.charactersPresent.length, 2)
    assert.equal(requestBody?.max_tokens, 500)
    assert.notInclude(JSON.stringify(requestBody), 'test-secret')
  })

  test('fails the acceptance check when the configured provider truncates the opening', async ({
    assert,
  }) => {
    const generator = new OpenAICompatibleStoryGenerator({
      fetch: async () =>
        new Response(
          JSON.stringify({
            choices: [{ finish_reason: 'length', message: { content: 'Incomplete opening' } }],
          }),
          { status: 200 }
        ),
      baseUrl: 'https://provider.example.test/v1',
      apiKey: 'test-secret',
      model: 'story-model',
      settings: { temperature: 0.8, maxTokens: 500 },
      timeoutMs: 100,
    })

    try {
      await generateOpeningSmoke(generator)
      assert.fail('Expected smoke check to fail for a truncated response')
    } catch (error) {
      if (!(error instanceof StoryGenerationError)) throw error
      assert.equal(error.code, 'malformed_response')
      assert.equal(error.message, 'Story provider returned truncated narration')
    }
  })
})
