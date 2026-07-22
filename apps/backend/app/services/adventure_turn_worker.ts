import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { randomUUID } from 'node:crypto'

const maximumAttempts = 2

export type ClaimedAdventureTurn = {
  adventureId: string
  turnId: string
  jobId: string
  generation: number
  attempt: number
  leaseToken: string
  startedAt: Date
  sourceRevisionId: string
}

export type TurnFinalizationContext = {
  trx: TransactionClientContract
  adventure: { id: string; generation: number; head_revision_id: string; turn_count: number }
  turn: { id: string; source_revision_id: string }
  completedAt: Date
}

export type AdventureTurnCompletion = {
  commit(context: TurnFinalizationContext): Promise<{ resultRevisionId: string }>
}

export class StaleAdventureTurnClaimError extends Error {
  constructor() {
    super('Adventure changed before turn resolution could be completed.')
    this.name = 'StaleAdventureTurnClaimError'
  }
}

export interface AdventureTurnCompletionPort {
  resolve(claim: ClaimedAdventureTurn, signal?: AbortSignal): Promise<AdventureTurnCompletion>
}

export type AdventureTurnWorkerResult =
  | { status: 'idle' }
  | {
      status: 'succeeded' | 'retry_scheduled' | 'failed' | 'stale'
      adventureId: string
      turnId: string
      attempt: number
    }

export default class AdventureTurnWorker {
  readonly #completion: AdventureTurnCompletionPort
  readonly #workerId: string
  readonly #now: () => Date
  readonly #leaseDurationMs: number

  constructor(options: {
    completion: AdventureTurnCompletionPort
    workerId: string
    now?: () => Date
    leaseDurationMs?: number
  }) {
    this.#completion = options.completion
    this.#workerId = options.workerId
    this.#now = options.now ?? (() => new Date())
    this.#leaseDurationMs = options.leaseDurationMs ?? 60_000
  }

  async claimOneForTest(): Promise<ClaimedAdventureTurn | null> {
    return db.transaction(async (trx) => {
      const now = this.#now()
      const job = await trx
        .from('adventure_jobs')
        .where('type', 'turn')
        .where('attempt_count', '<', maximumAttempts)
        .where((q) =>
          q
            .where((p) => p.where('status', 'pending').where('available_at', '<=', now))
            .orWhere((p) => p.where('status', 'processing').where('lease_expires_at', '<=', now))
        )
        .orderBy('available_at')
        .forUpdate()
        .skipLocked()
        .first()
      if (!job) return null
      const turn = await trx
        .from('adventure_turns')
        .where('id', job.turn_id)
        .whereIn('status', ['pending', 'processing'])
        .forUpdate()
        .first()
      const adventure =
        turn &&
        (await trx
          .from('adventures')
          .where('id', job.adventure_id)
          .where('generation', job.generation)
          .where('status', 'ready')
          .where('head_revision_id', turn.source_revision_id)
          .forUpdate()
          .first())
      if (!turn || !adventure) return null
      const attempt = job.attempt_count + 1
      const leaseToken = `${this.#workerId}:${randomUUID()}`
      await trx
        .from('adventure_jobs')
        .where('id', job.id)
        .update({
          status: 'processing',
          attempt_count: attempt,
          lease_owner: leaseToken,
          lease_expires_at: new Date(now.getTime() + this.#leaseDurationMs),
          failure_code: null,
          failure_message: null,
          updated_at: now,
        })
      await trx
        .from('adventure_turns')
        .where('id', turn.id)
        .update({ status: 'processing', updated_at: now })
      return {
        adventureId: adventure.id,
        turnId: turn.id,
        jobId: job.id,
        generation: adventure.generation,
        attempt,
        leaseToken,
        startedAt: now,
        sourceRevisionId: turn.source_revision_id,
      }
    })
  }

  async failOneExhaustedLease(): Promise<{
    status: 'failed'
    adventureId: string
    turnId: string
    attempt: number
  } | null> {
    return db.transaction(async (trx) => {
      const now = this.#now()
      const job = await trx
        .from('adventure_jobs')
        .where('type', 'turn')
        .where('status', 'processing')
        .where('attempt_count', '>=', maximumAttempts)
        .where('lease_expires_at', '<=', now)
        .orderBy('lease_expires_at')
        .forUpdate()
        .skipLocked()
        .first()
      if (!job) return null
      const turn = await trx
        .from('adventure_turns')
        .where('id', job.turn_id)
        .where('status', 'processing')
        .forUpdate()
        .first()
      if (!turn) return null
      await trx.from('adventure_jobs').where('id', job.id).update({
        status: 'failed',
        lease_owner: null,
        lease_expires_at: null,
        failure_code: 'lease_expired',
        failure_message: 'Turn resolution failed: lease_expired.',
        updated_at: now,
      })
      await trx
        .from('adventure_turns')
        .where('id', turn.id)
        .update({ status: 'failed', updated_at: now })
      return {
        status: 'failed' as const,
        adventureId: job.adventure_id,
        turnId: turn.id,
        attempt: job.attempt_count,
      }
    })
  }

  async #failStaleClaim(claim: ClaimedAdventureTurn): Promise<boolean> {
    return db.transaction(async (trx) => {
      const now = this.#now()
      const job = await trx
        .from('adventure_jobs')
        .where('id', claim.jobId)
        .where('adventure_id', claim.adventureId)
        .where('generation', claim.generation)
        .where('status', 'processing')
        .where('attempt_count', claim.attempt)
        .where('lease_owner', claim.leaseToken)
        .forUpdate()
        .first()
      const turn =
        job &&
        (await trx
          .from('adventure_turns')
          .where('id', claim.turnId)
          .where('status', 'processing')
          .where('source_revision_id', claim.sourceRevisionId)
          .forUpdate()
          .first())
      if (!job || !turn) return false

      await trx.from('adventure_jobs').where('id', job.id).update({
        status: 'failed',
        lease_owner: null,
        lease_expires_at: null,
        failure_code: 'stale_turn_claim',
        failure_message: 'Turn resolution is stale and cannot be retried.',
        updated_at: now,
      })
      await trx.from('adventure_turns').where('id', turn.id).update({
        status: 'failed',
        updated_at: now,
      })
      return true
    })
  }

  async finishClaimForTest(
    claim: ClaimedAdventureTurn,
    signal?: AbortSignal
  ): Promise<AdventureTurnWorkerResult> {
    try {
      const completion = await this.#completion.resolve(claim, signal)
      const succeeded = await db.transaction(async (trx) => {
        const job = await trx
          .from('adventure_jobs')
          .where('id', claim.jobId)
          .where('adventure_id', claim.adventureId)
          .where('generation', claim.generation)
          .where('status', 'processing')
          .where('attempt_count', claim.attempt)
          .where('lease_owner', claim.leaseToken)
          .forUpdate()
          .first()
        const turn =
          job &&
          (await trx
            .from('adventure_turns')
            .where('id', claim.turnId)
            .where('status', 'processing')
            .where('source_revision_id', claim.sourceRevisionId)
            .forUpdate()
            .first())
        const adventure =
          turn &&
          (await trx
            .from('adventures')
            .where('id', claim.adventureId)
            .where('generation', claim.generation)
            .where('status', 'ready')
            .where('head_revision_id', claim.sourceRevisionId)
            .forUpdate()
            .first())
        if (!job || !turn || !adventure) return false
        const completedAt = this.#now()
        const result = await completion.commit({ trx, adventure, turn, completedAt })
        await trx.from('adventure_turns').where('id', turn.id).update({
          status: 'succeeded',
          result_revision_id: result.resultRevisionId,
          updated_at: completedAt,
        })
        await trx.from('adventure_jobs').where('id', job.id).update({
          status: 'succeeded',
          lease_owner: null,
          lease_expires_at: null,
          failure_code: null,
          failure_message: null,
          updated_at: completedAt,
        })
        return true
      })
      if (succeeded) {
        return {
          status: 'succeeded',
          adventureId: claim.adventureId,
          turnId: claim.turnId,
          attempt: claim.attempt,
        }
      }
      const terminallyFailed = await this.#failStaleClaim(claim)
      return {
        status: terminallyFailed ? 'failed' : 'stale',
        adventureId: claim.adventureId,
        turnId: claim.turnId,
        attempt: claim.attempt,
      }
    } catch (error) {
      if (error instanceof StaleAdventureTurnClaimError) {
        const terminallyFailed = await this.#failStaleClaim(claim)
        return {
          status: terminallyFailed ? 'failed' : 'stale',
          adventureId: claim.adventureId,
          turnId: claim.turnId,
          attempt: claim.attempt,
        }
      }
      const now = this.#now()
      const retryScheduled = await db.transaction(async (trx) => {
        const job = await trx
          .from('adventure_jobs')
          .where('id', claim.jobId)
          .where('status', 'processing')
          .where('lease_owner', claim.leaseToken)
          .forUpdate()
          .first()
        if (!job) return false
        const retry = claim.attempt < maximumAttempts
        await trx
          .from('adventure_jobs')
          .where('id', job.id)
          .update({
            status: retry ? 'pending' : 'failed',
            available_at: now,
            lease_owner: null,
            lease_expires_at: null,
            failure_code: 'turn_completion_failed',
            failure_message: 'Turn resolution failed before publication.',
            updated_at: now,
          })
        await trx
          .from('adventure_turns')
          .where('id', claim.turnId)
          .where('status', 'processing')
          .update({ status: retry ? 'pending' : 'failed', updated_at: now })
        return retry
      })
      return {
        status: retryScheduled ? 'retry_scheduled' : 'failed',
        adventureId: claim.adventureId,
        turnId: claim.turnId,
        attempt: claim.attempt,
      }
    }
  }

  async runOnce(signal?: AbortSignal): Promise<AdventureTurnWorkerResult> {
    const exhausted = await this.failOneExhaustedLease()
    if (exhausted) return exhausted
    const claim = await this.claimOneForTest()
    if (!claim) return { status: 'idle' }
    return this.finishClaimForTest(claim, signal)
  }
}
