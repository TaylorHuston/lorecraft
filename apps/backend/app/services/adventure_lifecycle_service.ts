import type { WorldVersionSnapshot } from '#models/world_version'
import { completeInitialCharacterState } from '#services/character_field_limits'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export type AdventureResetResult = {
  adventureId: string
  status: 'opening_pending'
  generation: number
}

type AdventureLifecycleErrorCode =
  'ADVENTURE_NOT_FOUND' | 'ADVENTURE_BUSY' | 'ADVENTURE_NOT_RETRYABLE' | 'ADVENTURE_SOURCE_INVALID'

export class AdventureLifecycleError extends Error {
  declare code: AdventureLifecycleErrorCode
  declare status: number

  constructor(code: AdventureLifecycleErrorCode, status: number, message: string) {
    super(message)
    this.name = 'AdventureLifecycleError'
    this.code = code
    this.status = status
  }
}

function frozenStartingLocation(snapshot: WorldVersionSnapshot, startingPointKey: string) {
  const startingPoint = snapshot.startingPoints.find(
    (candidate) => candidate.key === startingPointKey
  )
  if (!startingPoint) return null

  return snapshot.locations.find((candidate) => candidate.key === startingPoint.locationKey) ?? null
}

async function lockAdventureJobs(trx: TransactionClientContract, adventureId: string) {
  return trx
    .from('adventure_jobs')
    .where('adventure_id', adventureId)
    .select('id', 'type', 'status')
    .forUpdate()
}

export default class AdventureLifecycleService {
  async retryOpening(adventureId: string, ownerId: number): Promise<AdventureResetResult> {
    this.#assertAdventureId(adventureId)

    return db.transaction(async (trx) => {
      const candidate = await trx
        .from('adventures')
        .where('id', adventureId)
        .where('owner_id', ownerId)
        .select('id')
        .first()
      if (!candidate) {
        throw new AdventureLifecycleError('ADVENTURE_NOT_FOUND', 404, 'Adventure not found.')
      }

      const jobs = await lockAdventureJobs(trx, candidate.id)
      const adventure = await trx
        .from('adventures')
        .where('id', candidate.id)
        .where('owner_id', ownerId)
        .select('id', 'status', 'generation')
        .forUpdate()
        .first()
      if (!adventure) {
        throw new AdventureLifecycleError('ADVENTURE_NOT_FOUND', 404, 'Adventure not found.')
      }
      if (adventure.status !== 'opening_failed') {
        throw new AdventureLifecycleError(
          'ADVENTURE_NOT_RETRYABLE',
          409,
          'Adventure opening is not ready to retry.'
        )
      }

      const activeJob = jobs.find((job) => ['pending', 'processing'].includes(job.status))
      if (activeJob) {
        throw new AdventureLifecycleError(
          'ADVENTURE_BUSY',
          409,
          'Adventure cannot retry while opening work is active.'
        )
      }

      const now = new Date()
      await trx.table('adventure_jobs').insert({
        adventure_id: adventure.id,
        generation: adventure.generation,
        type: 'opening',
        status: 'pending',
        attempt_count: 0,
        available_at: now,
        lease_owner: null,
        lease_expires_at: null,
        failure_code: null,
        failure_message: null,
        created_at: now,
        updated_at: null,
      })
      await trx.from('adventures').where('id', adventure.id).update({
        status: 'opening_pending',
        updated_at: now,
      })

      return {
        adventureId: adventure.id,
        status: 'opening_pending',
        generation: adventure.generation,
      }
    })
  }

  async reset(adventureId: string, ownerId: number): Promise<AdventureResetResult> {
    this.#assertAdventureId(adventureId)

    return db.transaction(async (trx) => {
      const candidate = await trx
        .from('adventures')
        .where('id', adventureId)
        .where('owner_id', ownerId)
        .select('id')
        .first()
      if (!candidate) {
        throw new AdventureLifecycleError('ADVENTURE_NOT_FOUND', 404, 'Adventure not found.')
      }

      const jobs = await lockAdventureJobs(trx, candidate.id)
      const adventure = await trx
        .from('adventures')
        .where('id', candidate.id)
        .where('owner_id', ownerId)
        .select('id', 'world_version_id', 'starting_point_key', 'status', 'generation')
        .forUpdate()
        .first()
      if (!adventure) {
        throw new AdventureLifecycleError('ADVENTURE_NOT_FOUND', 404, 'Adventure not found.')
      }

      if (!['ready', 'opening_failed'].includes(adventure.status)) {
        throw new AdventureLifecycleError(
          'ADVENTURE_BUSY',
          409,
          'Adventure cannot be reset while opening work is active.'
        )
      }

      const activeJob = jobs.find((job) => ['pending', 'processing'].includes(job.status))
      if (activeJob) {
        throw new AdventureLifecycleError(
          'ADVENTURE_BUSY',
          409,
          'Adventure cannot be reset while opening work is active.'
        )
      }

      const version = await trx
        .from('world_versions')
        .where('id', adventure.world_version_id)
        .select('snapshot')
        .first()
      const startingLocation = version
        ? frozenStartingLocation(
            version.snapshot as WorldVersionSnapshot,
            adventure.starting_point_key
          )
        : null
      if (!startingLocation) {
        throw new AdventureLifecycleError(
          'ADVENTURE_SOURCE_INVALID',
          409,
          'Adventure cannot be reset from its frozen source.'
        )
      }

      const now = new Date()
      const generation = adventure.generation + 1

      await trx.from('adventures').where('id', adventure.id).update({
        head_revision_id: null,
        updated_at: now,
      })
      await trx.from('adventure_turns').where('adventure_id', adventure.id).delete()
      await trx.from('adventure_story_entries').where('adventure_id', adventure.id).delete()
      await trx.from('adventure_revisions').where('adventure_id', adventure.id).delete()
      await trx.from('adventure_jobs').where('adventure_id', adventure.id).delete()
      await trx.from('adventure_character_states').where('adventure_id', adventure.id).delete()
      await trx.from('adventure_players').where('adventure_id', adventure.id).update({
        status: '',
        current_location_key: startingLocation.key,
        updated_at: now,
      })
      const snapshot = version.snapshot as WorldVersionSnapshot
      if (snapshot.characters.length > 0) {
        await trx.table('adventure_character_states').insert(
          snapshot.characters.map((character) => ({
            adventure_id: adventure.id,
            character_key: character.key,
            current_location_key: character.locationKey,
            ...completeInitialCharacterState(character),
            created_at: now,
            updated_at: null,
          }))
        )
      }
      await trx.from('adventures').where('id', adventure.id).update({
        status: 'opening_pending',
        generation,
        turn_count: 0,
        head_revision_id: null,
        updated_at: now,
      })
      await trx.table('adventure_jobs').insert({
        adventure_id: adventure.id,
        generation,
        type: 'opening',
        status: 'pending',
        attempt_count: 0,
        available_at: now,
        lease_owner: null,
        lease_expires_at: null,
        failure_code: null,
        failure_message: null,
        created_at: now,
        updated_at: null,
      })

      return {
        adventureId: adventure.id,
        status: 'opening_pending',
        generation,
      }
    })
  }

  async delete(adventureId: string, ownerId: number): Promise<void> {
    this.#assertAdventureId(adventureId)

    await db.transaction(async (trx) => {
      const candidate = await trx
        .from('adventures')
        .where('id', adventureId)
        .where('owner_id', ownerId)
        .select('id')
        .first()
      if (!candidate) {
        throw new AdventureLifecycleError('ADVENTURE_NOT_FOUND', 404, 'Adventure not found.')
      }
      await lockAdventureJobs(trx, candidate.id)
      const adventure = await trx
        .from('adventures')
        .where('id', candidate.id)
        .where('owner_id', ownerId)
        .select('id')
        .forUpdate()
        .first()
      if (!adventure) {
        throw new AdventureLifecycleError('ADVENTURE_NOT_FOUND', 404, 'Adventure not found.')
      }

      await trx.from('adventures').where('id', adventure.id).delete()
    })
  }

  #assertAdventureId(adventureId: string) {
    if (!uuidPattern.test(adventureId)) {
      throw new AdventureLifecycleError('ADVENTURE_NOT_FOUND', 404, 'Adventure not found.')
    }
  }
}
