import { test } from '@japa/runner'
import {
  adventureTurnContextLimits,
  assembleAdventureTurnContext,
  type AdventureTurnContextInput,
} from '#services/story_generation/adventure_turn_context'
import {
  assertNarrationSafeForPublication,
  assembleTurnPrompt,
  UnsafeNarrationPublicationError,
} from '#services/story_generation/turn_prompt'

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
        initialMood: 'Uneasy.',
        initialStatus: 'Watching the chapel door.',
        initialMemory: 'Taylor arrived during the storm.',
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
    assert.include(prompt.user, 'She has seen the missing bell rope.')
    assert.include(prompt.user, 'Taylor arrived during the storm.')
    assert.include(prompt.user, 'Wary')
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

  test('includes complete cards for current-Scene NPCs and excludes off-scene NPCs', ({
    assert,
  }) => {
    const context = assembleAdventureTurnContext({
      ...turnContextInput,
      frozenCanon: {
        ...turnContextInput.frozenCanon,
        characters: [
          ...turnContextInput.frozenCanon.characters,
          {
            key: 'outside',
            name: 'The Groundskeeper',
            physicalDescription: 'Mud-stained boots.',
            background: 'Tends the graveyard.',
            personality: 'Taciturn.',
            voice: 'Rough.',
            privateKnowledge: 'Hides the tower key.',
            initialMood: 'Distrustful.',
            initialStatus: 'Outside in the storm.',
            initialMemory: 'Has not met Taylor.',
            sortOrder: 20,
          },
        ],
      },
      currentState: {
        ...turnContextInput.currentState,
        characters: [
          ...turnContextInput.currentState.characters,
          {
            characterKey: 'outside',
            currentLocationKey: 'graveyard',
            mood: 'Distrustful.',
            currentStatus: 'Outside in the storm.',
            summarizedMemory: 'Has not met Taylor.',
          },
        ],
      },
    })
    const prompt = assembleTurnPrompt({ platformInstructions: 'GM.', context })

    assert.deepEqual(
      context.frozenCanon.characters.map((character) => character.key),
      ['mira']
    )
    assert.deepEqual(
      context.currentState.characters.map((character) => character.characterKey),
      ['mira']
    )
    assert.include(prompt.user, 'Private knowledge: She has seen the missing bell rope.')
    assert.include(prompt.user, 'Current mood: Wary')
    assert.notInclude(prompt.user, 'The Groundskeeper')
    assert.notInclude(prompt.user, 'Hides the tower key.')
  })

  test('uses local Debug card overrides for the next turn without changing frozen canon', ({
    assert,
  }) => {
    const context = assembleAdventureTurnContext({
      ...turnContextInput,
      currentState: {
        ...turnContextInput.currentState,
        characters: [
          {
            ...turnContextInput.currentState.characters[0],
            name: 'Mira of the Vestry',
            physicalDescription: 'Soot-streaked with a brass lantern.',
            background: 'Guards the chapel ledger after midnight.',
            personality: 'Focused and guarded.',
            voice: 'Low and clipped.',
            privateKnowledge: 'The ledger is sealed inside the vestry wall.',
          },
        ],
      },
    })
    const prompt = assembleTurnPrompt({ platformInstructions: 'GM.', context })

    assert.deepInclude(context.frozenCanon.characters[0], {
      name: 'Mira of the Vestry',
      privateKnowledge: 'The ledger is sealed inside the vestry wall.',
    })
    assert.equal(turnContextInput.frozenCanon.characters[0].name, 'Mira')
    assert.include(prompt.user, 'Mira of the Vestry')
    assert.include(prompt.user, 'The ledger is sealed inside the vestry wall.')
    assert.notInclude(prompt.user, 'She has seen the missing bell rope.')
  })

  test('LC-003/S2/R3-S5: rejects direct reflection of NPC private knowledge before publication', ({
    assert,
  }) => {
    const context = assembleAdventureTurnContext(turnContextInput)

    assert.throws(
      () =>
        assertNarrationSafeForPublication(
          'Mira admits that she has seen the missing bell rope.',
          context
        ),
      UnsafeNarrationPublicationError
    )
    assert.doesNotThrow(() =>
      assertNarrationSafeForPublication('Mira looks toward the bell tower in silence.', context)
    )
  })
})
