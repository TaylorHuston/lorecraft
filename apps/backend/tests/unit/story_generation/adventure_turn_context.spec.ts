import { test } from '@japa/runner'
import {
  adventureTurnContextLimits,
  assembleAdventureTurnContext,
  type AdventureTurnContextInput,
} from '#services/story_generation/adventure_turn_context'
import { assembleTurnPrompt } from '#services/story_generation/turn_prompt'

const turnContextInput: AdventureTurnContextInput = {
  frozenCanon: {
    world: {
      name: 'Stormbound Chapel',
      description: 'A chapel isolated by an endless storm.',
      adventureGuidance: 'Keep the mood tense and grounded.',
    },
    locations: [
      {
        key: 'nave',
        name: 'Chapel Nave',
        description: 'Cold candlelight trembles across cracked stone pews.',
        sortOrder: 10,
      },
    ],
    characters: [
      {
        key: 'mira',
        name: 'Mira',
        physicalDescription: 'Rain-dark clothes and watchful eyes.',
        background: 'A local who knows the chapel.',
        personality: 'Careful and observant.',
        voice: 'Quiet and direct.',
        privateKnowledge: 'She has seen the missing bell rope.',
        sortOrder: 10,
      },
    ],
  },
  currentState: {
    player: {
      name: 'Taylor',
      physicalDescription: null,
      backstory: null,
      currentLocationKey: 'nave',
    },
    characters: [
      {
        characterKey: 'mira',
        currentLocationKey: 'nave',
        mood: 'Wary',
        currentStatus: null,
        summarizedMemory: 'Taylor arrived during the storm.',
      },
    ],
  },
  trigger: 'act',
  input: 'Ask Mira about the bell.',
  storyHistory: [
    { sequence: 2, narration: 'The bell answers from somewhere below.' },
    { sequence: 1, narration: 'Rain rattles the chapel shutters.' },
  ],
}

test.group('Adventure turn context', () => {
  test('retains only a bounded, ordered story-visible history', ({ assert }) => {
    const context = assembleAdventureTurnContext({
      ...turnContextInput,
      storyHistory: Array.from(
        { length: adventureTurnContextLimits.maximumHistoryEntries + 2 },
        (_, index) => ({
          sequence: adventureTurnContextLimits.maximumHistoryEntries + 2 - index,
          narration: `entry-${index}-` + 'n'.repeat(4_100),
        })
      ),
    })

    assert.lengthOf(context.storyHistory, adventureTurnContextLimits.maximumHistoryEntries)
    assert.deepEqual(
      context.storyHistory.map((entry) => entry.sequence),
      Array.from(
        { length: adventureTurnContextLimits.maximumHistoryEntries },
        (_, index) => index + 3
      )
    )
    assert.lengthOf(
      context.storyHistory[0].narration,
      adventureTurnContextLimits.maximumNarrationCharacters
    )
  })

  test('excludes prior raw actions, Guide text, Pass markers, and operational records from turn context', ({
    assert,
  }) => {
    const priorGuide = 'private guide: put the real bell rope in Mira’s pocket'
    const context = assembleAdventureTurnContext({
      ...turnContextInput,
      storyHistory: [
        {
          sequence: 1,
          narration: 'Mira grips the ledger and looks toward the altar.',
          action: 'prior raw action: steal the ledger',
          guide: priorGuide,
          trigger: 'guide',
          modelEvidence: { authorization: 'do-not-leak' },
          rejectedMutations: [{ reason: 'unknown location' }],
          job: { status: 'succeeded' },
        } as unknown as (typeof turnContextInput.storyHistory)[number],
      ],
    })
    const prompt = assembleTurnPrompt({
      platformInstructions: 'You are Lorecraft’s Game Master.',
      context,
    })

    assert.deepEqual(context.storyHistory, [
      { sequence: 1, narration: 'Mira grips the ledger and looks toward the altar.' },
    ])
    assert.notInclude(prompt.user, priorGuide)
    assert.notInclude(prompt.user, 'prior raw action: steal the ledger')
    assert.notInclude(prompt.user, 'do-not-leak')
    assert.notInclude(prompt.user, 'unknown location')
    assert.notInclude(prompt.user, 'succeeded')
    assert.notInclude(prompt.user, 'She has seen the missing bell rope.')
    assert.notInclude(prompt.user, 'Taylor arrived during the storm.')
    assert.notInclude(prompt.user, 'Wary')
  })

  test('includes current Guide once as private current direction but not as normal history', ({
    assert,
  }) => {
    const guide = 'Have Mira notice the wet footprints without naming their owner.'
    const context = assembleAdventureTurnContext({
      ...turnContextInput,
      trigger: 'guide',
      input: guide,
    })
    const prompt = assembleTurnPrompt({ platformInstructions: 'GM.', context })

    assert.include(prompt.user, '[PRIVATE_CURRENT_GUIDE]')
    assert.include(prompt.user, guide)
    assert.notInclude(prompt.user, '[CURRENT_ACT]')
    assert.equal(
      context.storyHistory.every((entry) => !entry.narration.includes(guide)),
      true
    )
  })

  test('represents a Pass without a player input', ({ assert }) => {
    const context = assembleAdventureTurnContext({
      ...turnContextInput,
      trigger: 'pass',
      input: 'this must not cross the trigger boundary',
    })
    const prompt = assembleTurnPrompt({ platformInstructions: 'GM.', context })

    assert.isNull(context.input)
    assert.include(
      prompt.user,
      'The player deliberately passes; advance the scene without inventing player intent.'
    )
    assert.notInclude(prompt.user, 'this must not cross the trigger boundary')
  })
})
