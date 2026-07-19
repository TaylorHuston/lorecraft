import type { WorldVersionSnapshot } from '#models/world_version'
import db from '@adonisjs/lucid/services/db'

type PlayerProfileInput = {
  name: string
  physicalDescription?: string | null
  backstory?: string | null
}

export type CreateAdventureInput = {
  ownerId: number
  worldSlug: string
  creationRequestId: string
  player: PlayerProfileInput
}

export type AdventureCreationResult = {
  adventureId: string
  status: 'opening_pending' | 'opening_processing' | 'opening_failed' | 'ready'
  route: string
}

type AdventureCreationErrorCode =
  'INVALID_PROFILE' | 'INVALID_CREATION_REQUEST' | 'WORLD_NOT_FOUND' | 'WORLD_NOT_PLAYABLE'

export class AdventureCreationError extends Error {
  declare code: AdventureCreationErrorCode
  declare status: number
  declare fields?: Record<string, string[]>

  constructor(
    code: AdventureCreationErrorCode,
    status: number,
    message: string,
    fields?: Record<string, string[]>
  ) {
    super(message)
    this.name = 'AdventureCreationError'
    this.code = code
    this.status = status
    this.fields = fields
  }
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function normalizeProfile(profile: PlayerProfileInput | undefined) {
  const name = typeof profile?.name === 'string' ? profile.name.trim() : ''
  const physicalDescription =
    typeof profile?.physicalDescription === 'string'
      ? profile.physicalDescription.trim() || null
      : null
  const backstory = typeof profile?.backstory === 'string' ? profile.backstory.trim() || null : null
  const normalized = {
    name,
    physicalDescription,
    backstory,
  }
  const fields: Record<string, string[]> = {}

  if (!normalized.name || normalized.name.length > 100) {
    fields.name = ['Name must contain between 1 and 100 characters.']
  }
  if ((normalized.physicalDescription?.length ?? 0) > 2_000) {
    fields.physicalDescription = ['Physical description must not exceed 2000 characters.']
  }
  if ((normalized.backstory?.length ?? 0) > 8_000) {
    fields.backstory = ['Backstory must not exceed 8000 characters.']
  }

  if (Object.keys(fields).length > 0) {
    throw new AdventureCreationError(
      'INVALID_PROFILE',
      422,
      'The player profile is invalid.',
      fields
    )
  }

  return normalized
}

function validateCreationIdentity(input: CreateAdventureInput) {
  if (!uuidPattern.test(input.creationRequestId) || !input.worldSlug.trim()) {
    throw new AdventureCreationError(
      'INVALID_CREATION_REQUEST',
      422,
      'The Adventure creation request is invalid.'
    )
  }
}

function resultFor(adventure: { id: string; status: AdventureCreationResult['status'] }) {
  return {
    adventureId: adventure.id,
    status: adventure.status,
    route: `/adventures/${adventure.id}`,
  }
}

function playableStart(snapshot: WorldVersionSnapshot) {
  const defaultStarts = snapshot.startingPoints.filter((startingPoint) => startingPoint.isDefault)
  if (defaultStarts.length !== 1) return null

  const startingPoint = defaultStarts[0]
  const location = snapshot.locations.find(
    (candidate) => candidate.key === startingPoint.locationKey
  )
  if (!location) return null

  return { startingPoint, location }
}

export default class AdventureCreationService {
  async create(input: CreateAdventureInput): Promise<AdventureCreationResult> {
    validateCreationIdentity(input)
    const player = normalizeProfile(input.player)
    const worldSlug = input.worldSlug.trim()

    return db.transaction(async (trx) => {
      // Serialize creation requests per account so concurrent retries cannot create duplicate children.
      const owner = await trx
        .from('users')
        .where('id', input.ownerId)
        .select('id')
        .forUpdate()
        .first()
      if (!owner) {
        throw new AdventureCreationError('WORLD_NOT_FOUND', 404, 'World not found.')
      }

      const existing = await trx
        .from('adventures')
        .where('owner_id', input.ownerId)
        .where('creation_request_id', input.creationRequestId)
        .select('id', 'status')
        .first()
      if (existing) return resultFor(existing)

      const world = await trx
        .from('worlds')
        .where('slug', worldSlug)
        .where((query) => query.where('visibility', 'public').orWhere('author_id', input.ownerId))
        .select('id', 'current_version_id')
        .first()
      if (!world) {
        throw new AdventureCreationError('WORLD_NOT_FOUND', 404, 'World not found.')
      }
      if (!world.current_version_id) {
        throw new AdventureCreationError(
          'WORLD_NOT_PLAYABLE',
          409,
          'This World is not currently playable.'
        )
      }

      const version = await trx
        .from('world_versions')
        .where('id', world.current_version_id)
        .where('world_id', world.id)
        .select('id', 'snapshot')
        .first()
      const start = version ? playableStart(version.snapshot as WorldVersionSnapshot) : null
      if (!version || !start) {
        throw new AdventureCreationError(
          'WORLD_NOT_PLAYABLE',
          409,
          'This World is not currently playable.'
        )
      }

      const now = new Date()
      const [adventure] = await trx
        .table('adventures')
        .insert({
          owner_id: input.ownerId,
          world_id: world.id,
          world_version_id: version.id,
          starting_point_key: start.startingPoint.key,
          creation_request_id: input.creationRequestId,
          status: 'opening_pending',
          generation: 1,
          turn_count: 0,
          head_revision_id: null,
          last_played_at: now,
          created_at: now,
          updated_at: null,
        })
        .returning(['id', 'status'])

      await trx.table('adventure_players').insert({
        adventure_id: adventure.id,
        name: player.name,
        physical_description: player.physicalDescription,
        backstory: player.backstory,
        status: '',
        current_location_key: start.location.key,
        created_at: now,
        updated_at: null,
      })
      if (version.snapshot && (version.snapshot as WorldVersionSnapshot).characters.length > 0) {
        await trx.table('adventure_character_states').insert(
          (version.snapshot as WorldVersionSnapshot).characters.map((character) => ({
            adventure_id: adventure.id,
            character_key: character.key,
            current_location_key: character.locationKey,
            mood: '',
            status: '',
            memory: '',
            created_at: now,
            updated_at: null,
          }))
        )
      }
      await trx.table('adventure_jobs').insert({
        adventure_id: adventure.id,
        generation: 1,
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

      return resultFor(adventure)
    })
  }
}
