import WorldVersion, { type WorldVersionSnapshot } from '#models/world_version'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { createHash } from 'node:crypto'

const snapshotSchemaVersion = 2 as const
const stableKeyPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function validateStableKey(kind: 'Location' | 'Character' | 'Starting Point', key: string) {
  if (!stableKeyPattern.test(key)) {
    throw new Error(`${kind} stable key "${key}" is invalid.`)
  }
}

function locationKeyForReference(
  locationKeys: Map<number, string>,
  kind: 'Character' | 'Starting Point',
  key: string,
  locationId: number
) {
  const locationKey = locationKeys.get(locationId)
  if (!locationKey) {
    throw new Error(`${kind} stable key "${key}" references a missing Location.`)
  }
  return locationKey
}

export async function publishWorldVersionInTransaction(
  trx: TransactionClientContract,
  worldId: number
) {
  const world = await trx
    .from('worlds')
    .where('id', worldId)
    .select('id', 'slug', 'name', 'description', 'visibility', 'adventure_guidance')
    .forUpdate()
    .first()

  if (!world) throw new Error(`Cannot publish missing World ${worldId}.`)

  const locations = await trx
    .from('locations')
    .where('world_id', worldId)
    .orderBy('sort_order')
    .orderBy('key')
    .select('id', 'key', 'name', 'description', 'sort_order')
  const locationKeys = new Map<number, string>(
    locations.map((location) => [location.id, location.key])
  )
  const characters = await trx
    .from('characters')
    .where('world_id', worldId)
    .orderBy('sort_order')
    .orderBy('key')
    .select(
      'key',
      'name',
      'location_id',
      'physical_description',
      'background',
      'personality',
      'voice',
      'private_knowledge',
      'initial_mood',
      'initial_status',
      'initial_memory',
      'sort_order'
    )
  const startingPoints = await trx
    .from('world_starting_points')
    .where('world_id', worldId)
    .orderBy('sort_order')
    .orderBy('key')
    .select('key', 'name', 'location_id', 'opening_premise', 'sort_order', 'is_default')

  for (const location of locations) validateStableKey('Location', location.key)
  for (const character of characters) validateStableKey('Character', character.key)
  for (const startingPoint of startingPoints) validateStableKey('Starting Point', startingPoint.key)

  const snapshot: WorldVersionSnapshot = {
    schemaVersion: snapshotSchemaVersion,
    world: {
      slug: world.slug,
      name: world.name,
      description: world.description,
      visibility: world.visibility,
      adventureGuidance: world.adventure_guidance,
    },
    locations: locations.map((location) => ({
      key: location.key,
      name: location.name,
      description: location.description,
      sortOrder: location.sort_order,
    })),
    characters: characters.map((character) => ({
      key: character.key,
      name: character.name,
      locationKey: locationKeyForReference(
        locationKeys,
        'Character',
        character.key,
        character.location_id
      ),
      physicalDescription: character.physical_description,
      background: character.background,
      personality: character.personality,
      voice: character.voice,
      privateKnowledge: character.private_knowledge,
      initialMood: character.initial_mood,
      initialStatus: character.initial_status,
      initialMemory: character.initial_memory,
      sortOrder: character.sort_order,
    })),
    startingPoints: startingPoints.map((startingPoint) => ({
      key: startingPoint.key,
      name: startingPoint.name,
      locationKey: locationKeyForReference(
        locationKeys,
        'Starting Point',
        startingPoint.key,
        startingPoint.location_id
      ),
      openingPremise: startingPoint.opening_premise,
      sortOrder: startingPoint.sort_order,
      isDefault: startingPoint.is_default,
    })),
  }
  const contentHash = createHash('sha256').update(JSON.stringify(snapshot)).digest('hex')
  const existingVersion = await WorldVersion.query({ client: trx })
    .where('worldId', worldId)
    .where('contentHash', contentHash)
    .first()

  if (existingVersion) {
    await trx
      .from('worlds')
      .where('id', worldId)
      .update({ current_version_id: existingVersion.id, updated_at: new Date() })
    return existingVersion
  }

  const latestVersion = await trx
    .from('world_versions')
    .where('world_id', worldId)
    .orderBy('ordinal', 'desc')
    .select('ordinal')
    .first()
  const version = await WorldVersion.create(
    {
      worldId,
      ordinal: (latestVersion?.ordinal ?? 0) + 1,
      schemaVersion: snapshotSchemaVersion,
      contentHash,
      snapshot,
    },
    { client: trx }
  )

  await trx
    .from('worlds')
    .where('id', worldId)
    .update({ current_version_id: version.id, updated_at: new Date() })

  return version
}

export async function publishWorldVersion(worldId: number) {
  return db.transaction((trx) => publishWorldVersionInTransaction(trx, worldId))
}
