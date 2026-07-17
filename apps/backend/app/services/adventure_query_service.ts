import Adventure, { type AdventureStatus } from '#models/adventure'
import AdventureStoryEntry from '#models/adventure_story_entry'
import World from '#models/world'
import { DateTime } from 'luxon'

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export type AdventureSummaryDto = {
  id: string
  playerName: string
  status: AdventureStatus
  turnCount: number
  lastPlayedAt: string
  route: string
}

export type AdventureDetailDto = Omit<AdventureSummaryDto, 'playerName'> & {
  sourceWorld: {
    slug: string
    name: string
    worldVersionId: string
    startingPointKey: string
    route: string
  }
  player: {
    name: string
    physicalDescription: string | null
    backstory: string | null
    status: string
    currentLocation: {
      key: string
      name: string
    }
  }
  scene: {
    location: {
      key: string
      name: string
      description: string
    }
    npcs: Array<{
      key: string
      name: string
      physicalDescription: string
    }>
  }
  story: Array<{
    id: string
    kind: string
    content: string
  }>
}

function summaryFor(adventure: Adventure): AdventureSummaryDto {
  const lastPlayedAt = adventure.lastPlayedAt.toUTC().toISO()
  if (!lastPlayedAt) {
    throw new Error(`Adventure ${adventure.id} has an invalid last-played timestamp.`)
  }

  return {
    id: adventure.id,
    playerName: adventure.player.name,
    status: adventure.status,
    turnCount: adventure.turnCount,
    lastPlayedAt,
    route: `/adventures/${adventure.id}`,
  }
}

export default class AdventureQueryService {
  constructor(private readonly now: () => DateTime = () => DateTime.utc()) {}

  async listForWorld(ownerId: number, worldSlug: string): Promise<AdventureSummaryDto[] | null> {
    const world = await World.query()
      .where('slug', worldSlug)
      .where((query) => query.where('visibility', 'public').orWhere('authorId', ownerId))
      .first()

    if (!world) return null

    const adventures = await Adventure.query()
      .where('ownerId', ownerId)
      .where('worldId', world.id)
      .preload('player')
      .orderBy('lastPlayedAt', 'desc')
      .orderBy('createdAt', 'desc')

    return adventures.map(summaryFor)
  }

  async findForOwner(ownerId: number, adventureId: string): Promise<AdventureDetailDto | null> {
    if (!uuidPattern.test(adventureId)) return null

    const adventure = await Adventure.query()
      .where('id', adventureId)
      .where('ownerId', ownerId)
      .preload('player')
      .preload('worldVersion')
      .first()

    if (!adventure) return null

    if (adventure.status === 'ready') {
      adventure.lastPlayedAt = this.now()
      await adventure.save()
    }

    const snapshot = adventure.worldVersion.snapshot
    const currentLocation = snapshot.locations.find(
      (location) => location.key === adventure.player.currentLocationKey
    )
    if (!currentLocation) {
      throw new Error(
        `Adventure ${adventure.id} references missing frozen Location ${adventure.player.currentLocationKey}.`
      )
    }
    const storyEntries = adventure.headRevisionId
      ? await AdventureStoryEntry.query()
          .where('adventureId', adventure.id)
          .where('revisionId', adventure.headRevisionId)
          .orderBy('sequence')
          .orderBy('createdAt')
      : []

    const summary = summaryFor(adventure)
    return {
      id: summary.id,
      status: summary.status,
      turnCount: summary.turnCount,
      lastPlayedAt: summary.lastPlayedAt,
      route: summary.route,
      sourceWorld: {
        slug: snapshot.world.slug,
        name: snapshot.world.name,
        worldVersionId: adventure.worldVersionId,
        startingPointKey: adventure.startingPointKey,
        route: `/worlds/${snapshot.world.slug}`,
      },
      player: {
        name: adventure.player.name,
        physicalDescription: adventure.player.physicalDescription,
        backstory: adventure.player.backstory,
        status: adventure.player.status,
        currentLocation: {
          key: currentLocation.key,
          name: currentLocation.name,
        },
      },
      scene: {
        location: {
          key: currentLocation.key,
          name: currentLocation.name,
          description: currentLocation.description,
        },
        npcs: snapshot.characters
          .filter((character) => character.locationKey === currentLocation.key)
          .map((character) => ({
            key: character.key,
            name: character.name,
            physicalDescription: character.physicalDescription,
          })),
      },
      story: storyEntries.map((entry) => ({
        id: entry.id,
        kind: entry.kind,
        content: entry.content,
      })),
    }
  }
}
