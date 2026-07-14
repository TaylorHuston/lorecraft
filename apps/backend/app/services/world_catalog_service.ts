import World from '#models/world'

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
      .first()

    if (!world) return null
    return {
      ...summary(world),
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
        privateKnowledge: character.privateKnowledge,
        location: character.location
          ? { key: character.location.key, name: character.location.name }
          : null,
      })),
    }
  }
}
