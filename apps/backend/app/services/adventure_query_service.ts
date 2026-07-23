import Adventure, { type AdventureStatus } from '#models/adventure'
import AdventureStoryEntry from '#models/adventure_story_entry'
import World from '#models/world'
import db from '@adonisjs/lucid/services/db'
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
      background: string
      personality: string
      voice: string
      privateKnowledge: string
      currentLocation: { key: string; name: string }
      mood: string
      status: string
      memory: string
    }>
  }
  activeTurn: {
    id: string
    trigger: 'act' | 'pass' | 'guide'
    status: 'pending' | 'processing' | 'failed'
    content: string | null
  } | null
  story: Array<{
    id: string
    kind: 'narration' | 'act' | 'pass'
    content: string
  }>
}

function activeRevisionIds(
  revisions: Array<{ id: string; parent_revision_id: string | null }>,
  headRevisionId: string
) {
  const byId = new Map(revisions.map((revision) => [revision.id, revision]))
  const ids: string[] = []
  let cursor: string | null = headRevisionId
  while (cursor) {
    const revision = byId.get(cursor)
    if (!revision) throw new Error('Adventure revision lineage is invalid.')
    ids.push(revision.id)
    cursor = revision.parent_revision_id
  }
  return ids.reverse()
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

  async listForWorldIds(ownerId: number, worldIds: number[]) {
    const grouped = new Map<number, AdventureSummaryDto[]>()
    for (const worldId of worldIds) grouped.set(worldId, [])
    if (worldIds.length === 0) return grouped

    const adventures = await Adventure.query()
      .where('ownerId', ownerId)
      .whereIn('worldId', worldIds)
      .preload('player')
      .orderBy('lastPlayedAt', 'desc')
      .orderBy('createdAt', 'desc')

    for (const adventure of adventures) {
      grouped.get(adventure.worldId)?.push(summaryFor(adventure))
    }
    return grouped
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
    const [characterRows, activeTurn, revisions] = await Promise.all([
      db
        .from('adventure_character_states')
        .where('adventure_id', adventure.id)
        .select(
          'character_key',
          'current_location_key',
          'mood',
          'status',
          'memory',
          'name',
          'physical_description',
          'background',
          'personality',
          'voice',
          'private_knowledge'
        ),
      db
        .from('adventure_turns')
        .where('adventure_id', adventure.id)
        .whereIn('status', ['pending', 'processing', 'failed'])
        .orderByRaw("CASE status WHEN 'pending' THEN 0 WHEN 'processing' THEN 1 ELSE 2 END")
        .orderBy('created_at', 'desc')
        .select('id', 'trigger', 'status', 'input')
        .first(),
      adventure.headRevisionId
        ? db
            .from('adventure_revisions')
            .where('adventure_id', adventure.id)
            .select('id', 'parent_revision_id')
        : Promise.resolve([]),
    ])
    const characterStateByKey = new Map(
      characterRows.map((row) => [row.character_key as string, row])
    )
    const lineageIds = adventure.headRevisionId
      ? activeRevisionIds(revisions, adventure.headRevisionId)
      : []
    const [storyEntries, completedPlayerTurns] = lineageIds.length
      ? await Promise.all([
          AdventureStoryEntry.query()
            .where('adventureId', adventure.id)
            .whereIn('revisionId', lineageIds)
            .orderBy('createdAt')
            .orderBy('sequence'),
          db
            .from('adventure_turns')
            .where('adventure_id', adventure.id)
            .where('status', 'succeeded')
            .whereIn('trigger', ['act', 'pass'])
            .whereIn('result_revision_id', lineageIds)
            .select('id', 'trigger', 'input', 'result_revision_id'),
        ])
      : [[], []]
    const playerTurnByResultRevisionId = new Map(
      completedPlayerTurns.map((turn) => [turn.result_revision_id as string, turn])
    )
    const story = storyEntries.flatMap((entry) => {
      const playerTurn = playerTurnByResultRevisionId.get(entry.revisionId)
      if (playerTurn) playerTurnByResultRevisionId.delete(entry.revisionId)

      return [
        ...(playerTurn
          ? [
              {
                id: playerTurn.id as string,
                kind: playerTurn.trigger as 'act' | 'pass',
                content: playerTurn.trigger === 'pass' ? 'Pass' : (playerTurn.input as string),
              },
            ]
          : []),
        {
          id: entry.id,
          kind: 'narration' as const,
          content: entry.content,
        },
      ]
    })

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
          .filter(
            (character) =>
              (characterStateByKey.get(character.key)?.current_location_key ??
                character.locationKey) === currentLocation.key
          )
          .map((character) => {
            const state = characterStateByKey.get(character.key)
            return {
              key: character.key,
              name: (state?.name as string | null | undefined) ?? character.name,
              physicalDescription:
                (state?.physical_description as string | null | undefined) ??
                character.physicalDescription,
              background: (state?.background as string | null | undefined) ?? character.background,
              personality:
                (state?.personality as string | null | undefined) ?? character.personality,
              voice: (state?.voice as string | null | undefined) ?? character.voice,
              privateKnowledge:
                (state?.private_knowledge as string | null | undefined) ??
                character.privateKnowledge,
              currentLocation: {
                key: state?.current_location_key ?? character.locationKey,
                name: currentLocation.name,
              },
              mood: state?.mood ?? character.initialMood ?? '',
              status: state?.status ?? character.initialStatus ?? '',
              memory: state?.memory ?? character.initialMemory ?? '',
            }
          }),
      },
      activeTurn: activeTurn
        ? {
            id: activeTurn.id,
            trigger: activeTurn.trigger,
            status: activeTurn.status,
            content:
              activeTurn.trigger === 'act'
                ? activeTurn.input
                : activeTurn.trigger === 'pass'
                  ? 'Pass'
                  : null,
          }
        : null,
      story,
    }
  }
}
