import db from '@adonisjs/lucid/services/db'

export class AdventureTurnLifecycleError extends Error {
  constructor(
    readonly code: 'ADVENTURE_NOT_FOUND' | 'TURN_NOT_RETRYABLE' | 'TURN_NOT_DISCARDABLE',
    readonly status: number,
    message: string
  ) {
    super(message)
    this.name = 'AdventureTurnLifecycleError'
  }
}

type TurnLifecycleInput = { ownerId: number; adventureId: string; turnId: string }

export default class AdventureTurnLifecycleService {
  async retry(input: TurnLifecycleInput) {
    return db.transaction(async (trx) => {
      const turn = await trx
        .from('adventure_turns')
        .join('adventures', 'adventures.id', 'adventure_turns.adventure_id')
        .where('adventure_turns.id', input.turnId)
        .where('adventure_turns.adventure_id', input.adventureId)
        .where('adventures.owner_id', input.ownerId)
        .join('adventure_jobs', 'adventure_jobs.turn_id', 'adventure_turns.id')
        .select('adventure_turns.id', 'adventure_turns.status', 'adventure_jobs.failure_code')
        .forUpdate()
        .first()
      if (!turn)
        throw new AdventureTurnLifecycleError('ADVENTURE_NOT_FOUND', 404, 'Adventure not found.')
      if (turn.status !== 'failed' || turn.failure_code === 'stale_turn_claim') {
        throw new AdventureTurnLifecycleError(
          'TURN_NOT_RETRYABLE',
          409,
          'Turn is not ready to retry.'
        )
      }
      const now = new Date()
      await trx
        .from('adventure_turns')
        .where('id', turn.id)
        .update({ status: 'pending', updated_at: now })
      await trx.from('adventure_jobs').where('turn_id', turn.id).where('status', 'failed').update({
        status: 'pending',
        attempt_count: 0,
        available_at: now,
        lease_owner: null,
        lease_expires_at: null,
        failure_code: null,
        failure_message: null,
        updated_at: now,
      })
      return { id: turn.id, status: 'pending' as const }
    })
  }

  async discard(input: TurnLifecycleInput) {
    return db.transaction(async (trx) => {
      const turn = await trx
        .from('adventure_turns')
        .join('adventures', 'adventures.id', 'adventure_turns.adventure_id')
        .where('adventure_turns.id', input.turnId)
        .where('adventure_turns.adventure_id', input.adventureId)
        .where('adventures.owner_id', input.ownerId)
        .select(
          'adventure_turns.id',
          'adventure_turns.status',
          'adventure_turns.result_revision_id'
        )
        .forUpdate()
        .first()
      if (!turn)
        throw new AdventureTurnLifecycleError('ADVENTURE_NOT_FOUND', 404, 'Adventure not found.')
      if (!['failed', 'pending'].includes(turn.status) || turn.result_revision_id !== null) {
        throw new AdventureTurnLifecycleError(
          'TURN_NOT_DISCARDABLE',
          409,
          'Turn is not ready to discard.'
        )
      }
      await trx.from('adventure_turns').where('id', turn.id).delete()
    })
  }
}
