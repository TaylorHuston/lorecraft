import Character from '#models/character'
import { publishWorldVersionInTransaction } from '#services/world_version_publication_service'
import db from '@adonisjs/lucid/services/db'

export type CharacterCardInput = {
  key?: string
  name: string
  locationKey: string
  physicalDescription: string
  background: string
  personality: string
  voice: string
  privateKnowledge: string
  initialMood: string
  initialStatus: string
  initialMemory: string
}
export type CharacterCardDto = Required<CharacterCardInput>
export type WorldCharacterValidationField = 'key' | 'locationKey'
export class WorldCharacterError extends Error {
  constructor(
    readonly code: 'WORLD_NOT_FOUND' | 'CHARACTER_NOT_FOUND' | 'CHARACTER_VALIDATION_ERROR',
    readonly status: number,
    message: string,
    readonly field?: WorldCharacterValidationField
  ) {
    super(message)
  }
}
function dto(row: any): CharacterCardDto {
  return {
    key: row.key,
    name: row.name,
    locationKey: row.location_key ?? row.locationKey,
    physicalDescription: row.physical_description ?? row.physicalDescription,
    background: row.background,
    personality: row.personality,
    voice: row.voice,
    privateKnowledge: row.private_knowledge ?? row.privateKnowledge,
    initialMood: row.initial_mood ?? row.initialMood,
    initialStatus: row.initial_status ?? row.initialStatus,
    initialMemory: row.initial_memory ?? row.initialMemory,
  }
}
export default class WorldCharacterService {
  async create(authorId: number, slug: string, input: Required<CharacterCardInput>) {
    return db.transaction(async (trx) => {
      const world = await trx
        .from('worlds')
        .where('slug', slug)
        .where('author_id', authorId)
        .select('id')
        .forUpdate()
        .first()
      if (!world) throw new WorldCharacterError('WORLD_NOT_FOUND', 404, 'World not found.')
      const location = await trx
        .from('locations')
        .where('world_id', world.id)
        .where('key', input.locationKey)
        .select('id', 'key')
        .first()
      if (!location)
        throw new WorldCharacterError(
          'CHARACTER_VALIDATION_ERROR',
          422,
          'Character Location is not valid for this World.',
          'locationKey'
        )
      const exists = await trx
        .from('characters')
        .where('world_id', world.id)
        .where('key', input.key)
        .first()
      if (exists)
        throw new WorldCharacterError(
          'CHARACTER_VALIDATION_ERROR',
          422,
          'Character key is already used in this World.',
          'key'
        )
      const last = await trx
        .from('characters')
        .where('world_id', world.id)
        .max('sort_order as sortOrder')
        .first()
      const character = await Character.create(
        {
          worldId: world.id,
          locationId: location.id,
          key: input.key,
          name: input.name,
          physicalDescription: input.physicalDescription,
          background: input.background,
          personality: input.personality,
          voice: input.voice,
          privateKnowledge: input.privateKnowledge,
          initialMood: input.initialMood,
          initialStatus: input.initialStatus,
          initialMemory: input.initialMemory,
          sortOrder: Number(last?.sortOrder ?? -1) + 1,
        },
        { client: trx }
      )
      await publishWorldVersionInTransaction(trx, world.id)
      return dto({ ...character.$attributes, location_key: location.key })
    })
  }
  async update(
    authorId: number,
    slug: string,
    key: string,
    input: Omit<Required<CharacterCardInput>, 'key'>
  ) {
    return db.transaction(async (trx) => {
      const world = await trx
        .from('worlds')
        .where('slug', slug)
        .where('author_id', authorId)
        .select('id')
        .forUpdate()
        .first()
      if (!world) throw new WorldCharacterError('WORLD_NOT_FOUND', 404, 'World not found.')
      const character = await trx
        .from('characters')
        .where('world_id', world.id)
        .where('key', key)
        .select('id', 'key')
        .forUpdate()
        .first()
      if (!character)
        throw new WorldCharacterError('CHARACTER_NOT_FOUND', 404, 'Character not found.')
      const location = await trx
        .from('locations')
        .where('world_id', world.id)
        .where('key', input.locationKey)
        .select('id', 'key')
        .first()
      if (!location)
        throw new WorldCharacterError(
          'CHARACTER_VALIDATION_ERROR',
          422,
          'Character Location is not valid for this World.',
          'locationKey'
        )
      await trx.from('characters').where('id', character.id).update({
        location_id: location.id,
        name: input.name,
        physical_description: input.physicalDescription,
        background: input.background,
        personality: input.personality,
        voice: input.voice,
        private_knowledge: input.privateKnowledge,
        initial_mood: input.initialMood,
        initial_status: input.initialStatus,
        initial_memory: input.initialMemory,
        updated_at: new Date(),
      })
      await publishWorldVersionInTransaction(trx, world.id)
      return dto({ key: character.key, location_key: location.key, ...input })
    })
  }
  async destroy(authorId: number, slug: string, key: string) {
    return db.transaction(async (trx) => {
      const world = await trx
        .from('worlds')
        .where('slug', slug)
        .where('author_id', authorId)
        .select('id')
        .forUpdate()
        .first()
      if (!world) throw new WorldCharacterError('WORLD_NOT_FOUND', 404, 'World not found.')
      const deleted = await trx
        .from('characters')
        .where('world_id', world.id)
        .where('key', key)
        .delete()
      if (!deleted)
        throw new WorldCharacterError('CHARACTER_NOT_FOUND', 404, 'Character not found.')
      await publishWorldVersionInTransaction(trx, world.id)
    })
  }
}
