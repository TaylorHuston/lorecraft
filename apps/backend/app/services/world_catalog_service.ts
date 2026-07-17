import World from '#models/world'

export type WorldPlayabilityDto = {
  available: boolean
  reason: string | null
}

export type WorldSummaryDto = {
  id: number
  slug: string
  name: string
  description: string
  visibility: 'public' | 'private'
  readOnly: boolean
}

function summary(world: World): WorldSummaryDto {
  return {
    id: world.id,
    slug: world.slug,
    name: world.name,
    description: world.description,
    visibility: world.visibility,
    readOnly: true,
  }
}

function playabilityFor(world: World): WorldPlayabilityDto {
  const snapshot = world.currentVersion?.snapshot
  if (!snapshot) {
    return {
      available: false,
      reason: 'This World does not have a playable published version.',
    }
  }

  const defaultStarts = snapshot.startingPoints.filter((startingPoint) => startingPoint.isDefault)
  const defaultStart = defaultStarts.length === 1 ? defaultStarts[0] : null
  const hasStartingLocation =
    defaultStart !== null &&
    snapshot.locations.some((location) => location.key === defaultStart.locationKey)

  if (!defaultStart || !defaultStart.openingPremise.trim() || !hasStartingLocation) {
    return {
      available: false,
      reason: 'This World does not have a playable default Starting Point.',
    }
  }

  return { available: true, reason: null }
}

export default class WorldCatalogService {
  async listFor(userId: number) {
    const worlds = await World.query()
      .where('visibility', 'public')
      .orWhere('authorId', userId)
      .orderBy('name')
    return worlds.map(summary)
  }

  async findFor(userId: number, slug: string) {
    const world = await World.query()
      .where('slug', slug)
      .where((query) => query.where('visibility', 'public').orWhere('authorId', userId))
      .preload('locations', (query) => query.orderBy('sortOrder').orderBy('id'))
      .preload('characters', (query) =>
        query.orderBy('sortOrder').orderBy('id').preload('location')
      )
      .preload('currentVersion')
      .first()

    if (!world) return null
    return {
      ...summary(world),
      playability: playabilityFor(world),
      locations: world.locations.map((location) => ({
        key: location.key,
        name: location.name,
        description: location.description,
      })),
      characters: world.characters.map((character) => ({
        key: character.key,
        name: character.name,
        physicalDescription: character.physicalDescription,
        background: character.background,
        personality: character.personality,
        voice: character.voice,
        location: character.location
          ? { key: character.location.key, name: character.location.name }
          : null,
      })),
    }
  }
}
