import type { AdventureTurnTrigger } from '#models/adventure_turn'
import db from '@adonisjs/lucid/services/db'

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const ACT_INPUT_MAX_LENGTH = 4_000
export const GUIDE_INPUT_MAX_LENGTH = 1_200

export type SubmitAdventureTurnInput = {
  ownerId: number
  adventureId: string
  requestId: string
  trigger: AdventureTurnTrigger
  input?: string
}

export type AdventureTurnSubmissionResult = {
  id: string
  adventureId: string
  trigger: AdventureTurnTrigger
  status: 'pending' | 'processing' | 'succeeded' | 'failed'
  route: string
}

type AdventureTurnSubmissionErrorCode =
  | 'ADVENTURE_NOT_FOUND'
  | 'ADVENTURE_NOT_READY'
  | 'ADVENTURE_BUSY'
  | 'ADVENTURE_SOURCE_INVALID'
  | 'INVALID_TURN_INPUT'
  | 'TURN_REQUEST_CONFLICT'

export class AdventureTurnSubmissionError extends Error {
  declare code: AdventureTurnSubmissionErrorCode
  declare status: number

  constructor(code: AdventureTurnSubmissionErrorCode, status: number, message: string) {
    super(message)
    this.name = 'AdventureTurnSubmissionError'
    this.code = code
    this.status = status
  }
}

function normalizeInput(input: SubmitAdventureTurnInput) {
  if (!uuidPattern.test(input.adventureId)) {
    throw new AdventureTurnSubmissionError('ADVENTURE_NOT_FOUND', 404, 'Adventure not found.')
  }
  if (!uuidPattern.test(input.requestId)) {
    throw new AdventureTurnSubmissionError(
      'INVALID_TURN_INPUT',
      422,
      'The turn request is invalid.'
    )
  }

  if (input.trigger === 'pass') {
    if (input.input !== undefined && input.input !== null) {
      throw new AdventureTurnSubmissionError(
        'INVALID_TURN_INPUT',
        422,
        'A Pass turn cannot include player text.'
      )
    }
    return null
  }

  const value = typeof input.input === 'string' ? input.input.trim() : ''
  const maximumLength = input.trigger === 'act' ? ACT_INPUT_MAX_LENGTH : GUIDE_INPUT_MAX_LENGTH
  if (!value || value.length > maximumLength) {
    throw new AdventureTurnSubmissionError('INVALID_TURN_INPUT', 422, 'The turn input is invalid.')
  }

  return value
}

function resultFor(turn: {
  id: string
  adventure_id: string
  trigger: AdventureTurnTrigger
  status: AdventureTurnSubmissionResult['status']
}): AdventureTurnSubmissionResult {
  return {
    id: turn.id,
    adventureId: turn.adventure_id,
    trigger: turn.trigger,
    status: turn.status,
    route: `/adventures/${turn.adventure_id}`,
  }
}

export default class AdventureTurnSubmissionService {
  async submit(input: SubmitAdventureTurnInput): Promise<AdventureTurnSubmissionResult> {
    const normalizedInput = normalizeInput(input)

    return db.transaction(async (trx) => {
      const adventure = await trx
        .from('adventures')
        .where('id', input.adventureId)
        .where('owner_id', input.ownerId)
        .select('id', 'status', 'generation', 'head_revision_id')
        .forUpdate()
        .first()
      if (!adventure) {
        throw new AdventureTurnSubmissionError('ADVENTURE_NOT_FOUND', 404, 'Adventure not found.')
      }

      const existing = await trx
        .from('adventure_turns')
        .where('adventure_id', adventure.id)
        .where('request_id', input.requestId)
        .select('id', 'adventure_id', 'trigger', 'input', 'status')
        .first()
      if (existing) {
        if (existing.trigger !== input.trigger || existing.input !== normalizedInput) {
          throw new AdventureTurnSubmissionError(
            'TURN_REQUEST_CONFLICT',
            409,
            'This turn request identifier has already been used for another action.'
          )
        }
        return resultFor(existing)
      }

      if (adventure.status !== 'ready') {
        throw new AdventureTurnSubmissionError(
          'ADVENTURE_NOT_READY',
          409,
          'Adventure is not ready for a turn.'
        )
      }
      if (!adventure.head_revision_id) {
        throw new AdventureTurnSubmissionError(
          'ADVENTURE_SOURCE_INVALID',
          409,
          'Adventure cannot resolve a turn without an opening revision.'
        )
      }

      const activeTurn = await trx
        .from('adventure_turns')
        .where('adventure_id', adventure.id)
        .whereIn('status', ['pending', 'processing'])
        .select('id')
        .first()
      if (activeTurn) {
        throw new AdventureTurnSubmissionError(
          'ADVENTURE_BUSY',
          409,
          'Adventure already has a resolving turn.'
        )
      }

      const now = new Date()
      const [turn] = await trx
        .table('adventure_turns')
        .insert({
          adventure_id: adventure.id,
          request_id: input.requestId,
          trigger: input.trigger,
          input: normalizedInput,
          status: 'pending',
          source_revision_id: adventure.head_revision_id,
          result_revision_id: null,
          created_at: now,
          updated_at: null,
        })
        .returning(['id', 'adventure_id', 'trigger', 'status'])

      await trx.table('adventure_jobs').insert({
        adventure_id: adventure.id,
        turn_id: turn.id,
        generation: adventure.generation,
        type: 'turn',
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

      return resultFor(turn)
    })
  }
}
