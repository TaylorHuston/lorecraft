import {
  resolveAdventureMutations,
  type AdventureMutationState,
} from '#services/adventure_mutation_policy'
import type { WorldVersionSnapshot } from '#models/world_version'
import { test } from '@japa/runner'

const snapshot: WorldVersionSnapshot = {
  schemaVersion: 1,
  world: {
    slug: 'mutation-policy-world',
    name: 'Mutation Policy World',
    description: 'A frozen source for mutation policy tests.',
    visibility: 'private',
    adventureGuidance: '',
  },
  locations: [
    { key: 'chapel', name: 'Chapel', description: 'A cold chapel.', sortOrder: 0 },
    { key: 'crypt', name: 'Crypt', description: 'A dark crypt.', sortOrder: 1 },
  ],
  characters: [
    {
      key: 'mira',
      name: 'Mira',
      locationKey: 'chapel',
      physicalDescription: 'Rain-dark clothes.',
      background: 'A local.',
      personality: 'Watchful.',
      voice: 'Quiet.',
      privateKnowledge: 'She knows the bell.',
      initialMood: 'Wary.',
      initialStatus: 'Watching the chapel.',
      initialMemory: 'Taylor arrived in the storm.',
      sortOrder: 0,
    },
  ],
  startingPoints: [],
}

function currentState(): AdventureMutationState {
  return {
    player: { currentLocationKey: 'chapel' },
    characters: {
      mira: {
        currentLocationKey: 'chapel',
        mood: '',
        status: '',
        memory: '',
      },
    },
  }
}

test.group('Adventure mutation policy', () => {
  test('LC-003/S2/R4-S1 + R4-S2: accepts only allowlisted player and Adventure-owned character changes', ({
    assert,
  }) => {
    const state = currentState()
    const resolved = resolveAdventureMutations({
      snapshot,
      state,
      proposals: [
        { type: 'player_location', locationKey: 'crypt' },
        {
          type: 'character_state',
          characterKey: 'mira',
          locationKey: 'crypt',
          mood: 'afraid',
          currentStatus: 'holding a lantern',
          summarizedMemory: 'The bell rang below.',
        },
      ],
    })

    assert.deepEqual(resolved.accepted, [
      {
        accepted: true,
        actorType: 'player',
        actorKey: null,
        field: 'current_location_key',
        previousValue: 'chapel',
        resultingValue: 'crypt',
      },
      {
        accepted: true,
        actorType: 'character',
        actorKey: 'mira',
        field: 'current_location_key',
        previousValue: 'chapel',
        resultingValue: 'crypt',
      },
      {
        accepted: true,
        actorType: 'character',
        actorKey: 'mira',
        field: 'mood',
        previousValue: '',
        resultingValue: 'afraid',
      },
      {
        accepted: true,
        actorType: 'character',
        actorKey: 'mira',
        field: 'status',
        previousValue: '',
        resultingValue: 'holding a lantern',
      },
      {
        accepted: true,
        actorType: 'character',
        actorKey: 'mira',
        field: 'memory',
        previousValue: '',
        resultingValue: 'The bell rang below.',
      },
    ])
    assert.deepEqual(resolved.nextState, {
      player: { currentLocationKey: 'crypt' },
      characters: {
        mira: {
          currentLocationKey: 'crypt',
          mood: 'afraid',
          status: 'holding a lantern',
          memory: 'The bell rang below.',
        },
      },
    })
    assert.deepEqual(state, currentState())
  })

  test('LC-003/S2/R4-S3: rejects invalid proposals with bounded reasons without carrying untrusted values forward', ({
    assert,
  }) => {
    const rejectedValue = 'do not persist this arbitrary provider payload'
    const resolved = resolveAdventureMutations({
      snapshot,
      state: currentState(),
      proposals: [
        { actor: 'player', field: 'currentLocationKey', value: 'unknown-location' },
        { actor: 'character', characterKey: 'unknown-character', field: 'mood', value: 'angry' },
        {
          actor: 'character',
          characterKey: 'mira',
          field: 'privateKnowledge',
          value: rejectedValue,
        },
        { actor: 'world', field: 'name', value: rejectedValue },
        { actor: 'character', characterKey: 'mira', field: 'memory', value: 'm'.repeat(2_001) },
      ],
    })

    assert.deepEqual(resolved.accepted, [])
    assert.deepEqual(resolved.rejected, [
      {
        accepted: false,
        actorType: 'player',
        actorKey: null,
        field: 'current_location_key',
        rejectionCode: 'unknown_location',
      },
      {
        accepted: false,
        actorType: 'character',
        actorKey: 'unknown-character',
        field: 'mood',
        rejectionCode: 'unknown_character',
      },
      {
        accepted: false,
        actorType: 'character',
        actorKey: 'mira',
        field: 'unknown',
        rejectionCode: 'forbidden_field',
      },
      {
        accepted: false,
        actorType: 'unknown',
        actorKey: null,
        field: 'unknown',
        rejectionCode: 'unknown_actor',
      },
      {
        accepted: false,
        actorType: 'character',
        actorKey: 'mira',
        field: 'memory',
        rejectionCode: 'value_too_long',
      },
    ])
    assert.notInclude(JSON.stringify(resolved.rejected), rejectedValue)
    assert.deepEqual(resolved.nextState, currentState())
  })

  test('LC-003/S2/R4-S4: resolves proposals in order so immutable records carry deterministic prior values', ({
    assert,
  }) => {
    const resolved = resolveAdventureMutations({
      snapshot,
      state: currentState(),
      proposals: [
        { actor: 'character', characterKey: 'mira', field: 'mood', value: 'uneasy' },
        { actor: 'character', characterKey: 'mira', field: 'mood', value: 'afraid' },
        { actor: 'character', characterKey: 'mira', field: 'mood', value: 'afraid' },
      ],
    })

    assert.deepEqual(resolved.accepted, [
      {
        accepted: true,
        actorType: 'character',
        actorKey: 'mira',
        field: 'mood',
        previousValue: '',
        resultingValue: 'uneasy',
      },
      {
        accepted: true,
        actorType: 'character',
        actorKey: 'mira',
        field: 'mood',
        previousValue: 'uneasy',
        resultingValue: 'afraid',
      },
    ])
    assert.deepEqual(resolved.rejected, [
      {
        accepted: false,
        actorType: 'character',
        actorKey: 'mira',
        field: 'mood',
        rejectionCode: 'no_change',
      },
    ])
  })
})
