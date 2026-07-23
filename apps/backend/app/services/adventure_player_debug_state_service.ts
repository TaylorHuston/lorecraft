import type { WorldVersionSnapshot } from '#models/world_version'
import db from '@adonisjs/lucid/services/db'

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type AdventurePlayerDebugStateErrorCode =
  'ADVENTURE_NOT_FOUND' | 'ADVENTURE_NOT_READY' | 'ADVENTURE_BUSY' | 'INVALID_PLAYER_STATE'

export class AdventurePlayerDebugStateError extends Error {
  declare code: AdventurePlayerDebugStateErrorCode
  declare status: number

  constructor(code: AdventurePlayerDebugStateErrorCode, status: number, message: string) {
    super(message)
    this.name = 'AdventurePlayerDebugStateError'
    this.code = code
    this.status = status
  }
}

export type AdventurePlayerDebugStateInput = {
  ownerId: number
  adventureId: string
  name: string
  currentLocationKey: string
  physicalDescription: string
  backstory: string
  status: string
}

export function isAdventurePlayerDebugEditingEnabled(
  nodeEnv: 'development' | 'production' | 'test'
) {
  return nodeEnv !== 'production'
}

/** Changes only the owner Adventure's local Player state for development Debug work. */
export default class AdventurePlayerDebugStateService {
  async update(input: AdventurePlayerDebugStateInput) {
    if (!uuidPattern.test(input.adventureId)) {
      throw new AdventurePlayerDebugStateError('ADVENTURE_NOT_FOUND', 404, 'Adventure not found.')
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
        throw new AdventurePlayerDebugStateError('ADVENTURE_NOT_FOUND', 404, 'Adventure not found.')
      }
      if (adventure.status !== 'ready') {
        throw new AdventurePlayerDebugStateError(
          'ADVENTURE_NOT_READY',
          409,
          'Player state can only be edited after the Adventure is ready.'
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
        throw new AdventurePlayerDebugStateError(
          'ADVENTURE_BUSY',
          409,
          'Player state cannot be edited while a turn is resolving.'
        )
      }
      const version = await trx
        .from('world_versions')
        .where('id', adventure.world_version_id)
        .select('snapshot')
        .first()
      const snapshot = version?.snapshot as WorldVersionSnapshot | undefined
      if (!snapshot?.locations.some((location) => location.key === input.currentLocationKey)) {
        throw new AdventurePlayerDebugStateError(
          'INVALID_PLAYER_STATE',
          422,
          'Player state must use a Location from the frozen World.'
        )
      }
      const player = await trx
        .from('adventure_players')
        .where('adventure_id', adventure.id)
        .select('adventure_id')
        .forUpdate()
        .first()
      if (!player) {
        throw new AdventurePlayerDebugStateError(
          'ADVENTURE_NOT_READY',
          409,
          'Player state cannot be edited because the Adventure state is incomplete.'
        )
      }
      const now = new Date()
      await trx
        .from('adventure_players')
        .where('adventure_id', adventure.id)
        .update({
          name: input.name,
          current_location_key: input.currentLocationKey,
          physical_description: input.physicalDescription || null,
          backstory: input.backstory || null,
          status: input.status,
          updated_at: now,
        })
      await trx.from('adventures').where('id', adventure.id).update({
        last_played_at: now,
        updated_at: now,
      })
    })
  }
}
