import { test } from '@japa/runner'
import {
  AdventureStateExtractionError,
  adventureStateExtractionLimits,
  parseAdventureStateExtraction,
} from '#services/story_generation/adventure_state_extractor'
import { assembleAdventureStateExtractionPrompt } from '#services/story_generation/adventure_state_extraction_prompt'

test.group('Adventure state extractor contract', () => {
  test('accepts only allowlisted structured proposals', ({ assert }) => {
    const extraction = parseAdventureStateExtraction(
      JSON.stringify({
        proposals: [
          { type: 'player_location', locationKey: 'bell-tower' },
          {
            type: 'character_state',
            characterKey: 'mira',
            locationKey: 'bell-tower',
            mood: 'frightened',
            currentStatus: 'searching for the rope',
            summarizedMemory: 'Taylor heard the bell beneath the chapel.',
          },
        ],
      })
    )

    assert.deepEqual(extraction, {
      proposals: [
        { type: 'player_location', locationKey: 'bell-tower' },
        {
          type: 'character_state',
          characterKey: 'mira',
          locationKey: 'bell-tower',
          mood: 'frightened',
          currentStatus: 'searching for the rope',
          summarizedMemory: 'Taylor heard the bell beneath the chapel.',
        },
      ],
    })
  })

  test('rejects malformed, operational, forbidden, and oversized extractor output without echoing it', ({
    assert,
  }) => {
    const privateValue = 'provider-private-response-' + 'x'.repeat(200)
    const malformedOutputs = [
      'not-json',
      JSON.stringify([]),
      JSON.stringify({ proposals: 'not-an-array' }),
      JSON.stringify({ proposals: [{ type: 'source_canon_mutation', worldId: 'other-world' }] }),
      JSON.stringify({
        proposals: [{ type: 'player_location', locationKey: 'nave', sql: 'DROP TABLE' }],
      }),
      JSON.stringify({ proposals: [{ type: 'character_state', characterKey: 'mira' }] }),
      JSON.stringify({
        proposals: [{ type: 'character_state', characterKey: 'mira', mood: 'x'.repeat(161) }],
      }),
      JSON.stringify({
        proposals: Array.from(
          { length: adventureStateExtractionLimits.maximumProposals + 1 },
          () => ({ type: 'player_location', locationKey: 'nave' })
        ),
      }),
      JSON.stringify({ proposals: [{ type: 'player_location', locationKey: privateValue }] }) +
        ' '.repeat(100_000),
    ]

    for (const rawOutput of malformedOutputs) {
      try {
        parseAdventureStateExtraction(rawOutput)
        assert.fail('Expected malformed extraction output to fail')
      } catch (error) {
        if (!(error instanceof AdventureStateExtractionError)) throw error
        assert.equal(error.code, 'malformed_response')
        assert.equal(error.message, 'Adventure state extractor returned a malformed response')
        assert.notInclude(error.message, privateValue)
        assert.notInclude(JSON.stringify(error), privateValue)
      }
    }
  })

  test('gives the extraction operation staged narration and current state only', ({ assert }) => {
    const prompt = assembleAdventureStateExtractionPrompt({
      narration: 'Mira points toward the bell tower.',
      currentState: {
        player: {
          name: 'Taylor',
          physicalDescription: null,
          backstory: null,
          currentLocationKey: 'nave',
        },
        characters: [],
      },
    })

    assert.include(prompt.user, 'Mira points toward the bell tower.')
    assert.include(prompt.user, 'currentLocationKey')
    assert.notInclude(prompt.user, 'PRIVATE_CURRENT_GUIDE')
    assert.notInclude(prompt.user, 'STORY_VISIBLE_HISTORY')
  })
})
