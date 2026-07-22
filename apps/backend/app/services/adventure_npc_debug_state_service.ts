import {
  resolveAdventureMutations,
  type AdventureMutationState,
} from '#services/adventure_mutation_policy'
import type { WorldVersionSnapshot } from '#models/world_version'
import db from '@adonisjs/lucid/services/db'

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type AdventureNpcDebugStateErrorCode =
  | 'ADVENTURE_NOT_FOUND'
  | 'ADVENTURE_NOT_READY'
  | 'ADVENTURE_BUSY'
  | 'NPC_NOT_FOUND'
  | 'INVALID_NPC_STATE'

export class AdventureNpcDebugStateError extends Error {
  declare code: AdventureNpcDebugStateErrorCode
  declare status: number

  constructor(code: AdventureNpcDebugStateErrorCode, status: number, message: string) {
    super(message)
    this.name = 'AdventureNpcDebugStateError'
    this.code = code
    this.status = status
  }
}

export type AdventureNpcDebugStateInput = {
  ownerId: number
  adventureId: string
  characterKey: string
  name: string
  currentLocationKey: string
  physicalDescription: string
  background: string
  personality: string
  voice: string
  privateKnowledge: string
  mood: string
  status: string
  memory: string
}

export function isAdventureNpcDebugEditingEnabled(nodeEnv: 'development' | 'production' | 'test') {
  return nodeEnv !== 'production'
}

/**
 * Changes only the owner Adventure's current NPC state for local Debug work.
 * It deliberately never loads or mutates the source World Character row.
 */
export default class AdventureNpcDebugStateService {
  async update(input: AdventureNpcDebugStateInput) {
    if (!uuidPattern.test(input.adventureId)) {
      throw new AdventureNpcDebugStateError('ADVENTURE_NOT_FOUND', 404, 'Adventure not found.')
    }

    return db.transaction(async (trx) => {
      const adventure = await trx
        .from('adventures')
        .where('id', input.adventureId)
        .where('owner_id', input.ownerId)
        .select('id', 'status', 'world_version_id')
        .forUpdate()
        .first()
      if (!adventure) {
        throw new AdventureNpcDebugStateError('ADVENTURE_NOT_FOUND', 404, 'Adventure not found.')
      }
      if (adventure.status !== 'ready') {
        throw new AdventureNpcDebugStateError(
          'ADVENTURE_NOT_READY',
          409,
          'NPC state can only be edited after the Adventure is ready.'
        )
      }

      const activeTurn = await trx
        .from('adventure_turns')
        .where('adventure_id', adventure.id)
        .whereIn('status', ['pending', 'processing'])
        .select('id')
        .forUpdate()
        .first()
      if (activeTurn) {
        throw new AdventureNpcDebugStateError(
          'ADVENTURE_BUSY',
          409,
          'NPC state cannot be edited while a turn is resolving.'
        )
      }

      const version = await trx
        .from('world_versions')
        .where('id', adventure.world_version_id)
        .select('snapshot')
        .first()
      const snapshot = version?.snapshot as WorldVersionSnapshot | undefined
      if (!snapshot) {
        throw new AdventureNpcDebugStateError(
          'ADVENTURE_NOT_READY',
          409,
          'NPC state cannot be edited because the frozen source is unavailable.'
        )
      }
      if (!snapshot.characters.some((character) => character.key === input.characterKey)) {
        throw new AdventureNpcDebugStateError('NPC_NOT_FOUND', 404, 'NPC not found.')
      }

      const rows = await trx
        .from('adventure_character_states')
        .where('adventure_id', adventure.id)
        .select(
          'character_key',
          'current_location_key',
          'mood',
          'status',
          'memory',
          'name',
          'physical_description',
          'background',
          'personality',
          'voice',
          'private_knowledge'
        )
        .forUpdate()
      if (!rows.some((row) => row.character_key === input.characterKey)) {
        throw new AdventureNpcDebugStateError(
          'ADVENTURE_NOT_READY',
          409,
          'NPC state cannot be edited because the Adventure state is incomplete.'
        )
      }
      const state: AdventureMutationState = {
        player: { currentLocationKey: '' },
        characters: Object.fromEntries(
          snapshot.characters.map((character) => {
            const row = rows.find((candidate) => candidate.character_key === character.key)
            return [
              character.key,
              {
                currentLocationKey:
                  (row?.current_location_key as string | undefined) ?? character.locationKey,
                mood: (row?.mood as string | undefined) ?? character.initialMood ?? '',
                status: (row?.status as string | undefined) ?? character.initialStatus ?? '',
                memory: (row?.memory as string | undefined) ?? character.initialMemory ?? '',
              },
            ]
          })
        ),
      }
      const resolved = resolveAdventureMutations({
        snapshot,
        state,
        proposals: [
          {
            actor: 'character',
            characterKey: input.characterKey,
            field: 'currentLocationKey',
            value: input.currentLocationKey,
          },
          {
            actor: 'character',
            characterKey: input.characterKey,
            field: 'mood',
            value: input.mood,
          },
          {
            actor: 'character',
            characterKey: input.characterKey,
            field: 'status',
            value: input.status,
          },
          {
            actor: 'character',
            characterKey: input.characterKey,
            field: 'memory',
            value: input.memory,
          },
        ],
      })
      if (resolved.rejected.some((rejection) => rejection.rejectionCode !== 'no_change')) {
        throw new AdventureNpcDebugStateError(
          'INVALID_NPC_STATE',
          422,
          'NPC state must use a frozen Location and the supported field limits.'
        )
      }

      const next = resolved.nextState.characters[input.characterKey]
      if (!next) {
        throw new AdventureNpcDebugStateError('NPC_NOT_FOUND', 404, 'NPC not found.')
      }
      const source = snapshot.characters.find((character) => character.key === input.characterKey)!
      const current = rows.find((row) => row.character_key === input.characterKey)!
      const hasCardChanges =
        input.name !== ((current.name as string | null) ?? source.name) ||
        input.physicalDescription !==
          ((current.physical_description as string | null) ?? source.physicalDescription) ||
        input.background !== ((current.background as string | null) ?? source.background) ||
        input.personality !== ((current.personality as string | null) ?? source.personality) ||
        input.voice !== ((current.voice as string | null) ?? source.voice) ||
        input.privateKnowledge !==
          ((current.private_knowledge as string | null) ?? source.privateKnowledge)
      if (resolved.accepted.length > 0 || hasCardChanges) {
        const now = new Date()
        await trx
          .from('adventure_character_states')
          .where('adventure_id', adventure.id)
          .where('character_key', input.characterKey)
          .update({
            current_location_key: next.currentLocationKey,
            mood: next.mood,
            status: next.status,
            memory: next.memory,
            name: input.name,
            physical_description: input.physicalDescription,
            background: input.background,
            personality: input.personality,
            voice: input.voice,
            private_knowledge: input.privateKnowledge,
            updated_at: now,
          })
        await trx.from('adventures').where('id', adventure.id).update({
          last_played_at: now,
          updated_at: now,
        })
      }
    })
  }
}
