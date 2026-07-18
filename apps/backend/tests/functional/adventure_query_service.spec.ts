import Character from '#models/character'
import Location from '#models/location'
import StartingPoint from '#models/starting_point'
import User from '#models/user'
import World from '#models/world'
import AdventureCreationService from '#services/adventure_creation_service'
import AdventureQueryService from '#services/adventure_query_service'
import { publishWorldVersion } from '#services/world_version_publication_service'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

async function createUser(email: string) {
  return User.create({ email, password: 'correct horse battery staple' })
}

async function createPlayableWorld(
  authorId: number,
  slug: string,
  visibility: 'public' | 'private'
) {
  const world = await World.create({
    authorId,
    slug,
    name: 'Frozen Query World',
    description: 'The original frozen World description.',
    visibility,
    adventureGuidance: 'Keep the Adventure grounded in frozen canon.',
  })
  const location = await Location.create({
    worldId: world.id,
    key: 'chapel-threshold',
    name: 'Chapel Threshold',
    description: 'Rain runs down the locked chapel doors.',
    sortOrder: 0,
  })
  await Character.create({
    worldId: world.id,
    locationId: location.id,
    key: 'warden-hale',
    name: 'Warden Hale',
    physicalDescription: 'A weathered keeper in a salt-stained coat.',
    background: 'He has guarded the chapel for decades.',
    personality: 'Reserved and watchful.',
    voice: 'Low and deliberate.',
    privateKnowledge: 'He knows who rang the bell.',
    sortOrder: 0,
  })
  await StartingPoint.create({
    worldId: world.id,
    locationId: location.id,
    key: 'chapel-arrival',
    name: 'Chapel Arrival',
    openingPremise: 'The bell rings although no one is inside.',
    sortOrder: 0,
    isDefault: true,
  })
  const version = await publishWorldVersion(world.id)

  return { world, location, version }
}

async function createAdventure(
  ownerId: number,
  worldSlug: string,
  requestId: string,
  name: string
) {
  return new AdventureCreationService().create({
    ownerId,
    worldSlug,
    creationRequestId: requestId,
    player: { name },
  })
}

test.group('AdventureQueryService', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('LC-003/S1/R4-S1: lists only the owner Adventures under an accessible World', async ({
    assert,
  }) => {
    const author = await createUser('query-list-author@example.com')
    const owner = await createUser('query-list-owner@example.com')
    const otherOwner = await createUser('query-list-other-owner@example.com')
    const { world } = await createPlayableWorld(author.id, 'query-list-world', 'public')
    const inaccessible = await createPlayableWorld(author.id, 'query-list-private-world', 'private')
    const owned = await createAdventure(
      owner.id,
      world.slug,
      '11111111-1111-4111-8111-111111111111',
      'Mara Venn'
    )
    const otherOwned = await createAdventure(
      otherOwner.id,
      world.slug,
      '22222222-2222-4222-8222-222222222222',
      'Someone Else'
    )
    const lastPlayedAt = new Date('2026-07-16T18:30:00.000Z')
    await db
      .from('adventures')
      .where('id', owned.adventureId)
      .update({ status: 'ready', turn_count: 3, last_played_at: lastPlayedAt })

    const service = new AdventureQueryService()
    const result = await service.listForWorld(owner.id, world.slug)

    assert.deepEqual(result, [
      {
        id: owned.adventureId,
        playerName: 'Mara Venn',
        status: 'ready',
        turnCount: 3,
        lastPlayedAt: '2026-07-16T18:30:00.000Z',
        route: `/adventures/${owned.adventureId}`,
      },
    ])
    assert.isNull(await service.findForOwner(owner.id, otherOwned.adventureId))
    assert.isNull(await service.listForWorld(owner.id, inaccessible.world.slug))

    const grouped = await service.listForWorldIds(owner.id, [world.id, inaccessible.world.id])
    assert.deepEqual(grouped.get(world.id), result)
    assert.deepEqual(grouped.get(inaccessible.world.id), [])
  })

  test('LC-003/S1/R2-S2 + R4-S1: reads visible Adventure state from its frozen source projection', async ({
    assert,
  }) => {
    const author = await createUser('query-read-author@example.com')
    const owner = await createUser('query-read-owner@example.com')
    const { world, location, version } = await createPlayableWorld(
      author.id,
      'query-read-world',
      'public'
    )
    const created = await new AdventureCreationService().create({
      ownerId: owner.id,
      worldSlug: world.slug,
      creationRequestId: '33333333-3333-4333-8333-333333333333',
      player: {
        name: 'Mara Venn',
        physicalDescription: 'A rain-dark coat and a silver scar across one palm.',
        backstory: 'Mara came to the chapel looking for her missing brother.',
      },
    })
    const now = new Date('2026-07-16T19:45:00.000Z')
    const [revision] = await db
      .table('adventure_revisions')
      .insert({
        adventure_id: created.adventureId,
        sequence: 0,
        kind: 'opening',
        parent_revision_id: null,
        created_at: now,
      })
      .returning('id')
    const [storyEntry] = await db
      .table('adventure_story_entries')
      .insert({
        adventure_id: created.adventureId,
        revision_id: revision.id,
        sequence: 0,
        kind: 'narration',
        content: 'The chapel bell answered the storm with one impossible note.',
        created_at: now,
      })
      .returning('id')
    await db
      .from('adventures')
      .where('id', created.adventureId)
      .update({ status: 'ready', head_revision_id: revision.id, last_played_at: now })
    await db
      .from('adventure_players')
      .where('adventure_id', created.adventureId)
      .update({ status: 'Listening at the locked doors.' })

    const job = await db
      .from('adventure_jobs')
      .where('adventure_id', created.adventureId)
      .firstOrFail()
    await db.table('model_calls').insert({
      adventure_id: created.adventureId,
      job_id: job.id,
      operation: 'opening',
      request_metadata: { byteCount: 100, timeoutMs: 1_000 },
      response_metadata: { byteCount: 32, statusCode: 200 },
      provider: 'test-provider',
      model: 'secret-model-name',
      settings: { temperature: 0.7 },
      status: 'succeeded',
      started_at: now,
      completed_at: now,
      duration_ms: 0,
      retry_of_model_call_id: null,
      failure_code: null,
      failure_message: null,
      created_at: now,
      updated_at: null,
    })

    await World.query().where('id', world.id).update({
      name: 'Changed Current World',
      description: 'Current canon no longer matches the Adventure source.',
      adventureGuidance: 'Changed guidance.',
    })
    await Location.query().where('id', location.id).update({
      name: 'Changed Current Location',
      description: 'Current canon changed after Adventure creation.',
    })
    await Character.query().where('worldId', world.id).update({
      name: 'Changed Current NPC',
      physicalDescription: 'A changed current description.',
      privateKnowledge: 'A changed current secret.',
    })
    const newerVersion = await publishWorldVersion(world.id)
    assert.notEqual(newerVersion.id, version.id)

    const resumedAt = DateTime.fromISO('2026-07-16T20:15:00.000Z', { zone: 'utc' })
    const result = await new AdventureQueryService(() => resumedAt).findForOwner(
      owner.id,
      created.adventureId
    )

    assert.deepEqual(result, {
      id: created.adventureId,
      status: 'ready',
      turnCount: 0,
      lastPlayedAt: '2026-07-16T20:15:00.000Z',
      route: `/adventures/${created.adventureId}`,
      sourceWorld: {
        slug: 'query-read-world',
        name: 'Frozen Query World',
        worldVersionId: version.id,
        startingPointKey: 'chapel-arrival',
        route: '/worlds/query-read-world',
      },
      player: {
        name: 'Mara Venn',
        physicalDescription: 'A rain-dark coat and a silver scar across one palm.',
        backstory: 'Mara came to the chapel looking for her missing brother.',
        status: 'Listening at the locked doors.',
        currentLocation: {
          key: 'chapel-threshold',
          name: 'Chapel Threshold',
        },
      },
      scene: {
        location: {
          key: 'chapel-threshold',
          name: 'Chapel Threshold',
          description: 'Rain runs down the locked chapel doors.',
        },
        npcs: [
          {
            key: 'warden-hale',
            name: 'Warden Hale',
            physicalDescription: 'A weathered keeper in a salt-stained coat.',
          },
        ],
      },
      story: [
        {
          id: storyEntry.id,
          kind: 'narration',
          content: 'The chapel bell answered the storm with one impossible note.',
        },
      ],
    })
    const resumed = await db
      .from('adventures')
      .where('id', created.adventureId)
      .select('last_played_at')
      .firstOrFail()
    assert.equal(new Date(resumed.last_played_at).toISOString(), '2026-07-16T20:15:00.000Z')
  })

  test('LC-003/S1/R4-S1: pending polling does not change last played time', async ({ assert }) => {
    const author = await createUser('query-pending-author@example.com')
    const owner = await createUser('query-pending-owner@example.com')
    const { world } = await createPlayableWorld(author.id, 'query-pending-world', 'public')
    const created = await createAdventure(
      owner.id,
      world.slug,
      '44444444-4444-4444-8444-444444444444',
      'Mara Venn'
    )
    const original = new Date('2026-07-16T18:00:00.000Z')
    await db
      .from('adventures')
      .where('id', created.adventureId)
      .update({ last_played_at: original })

    await new AdventureQueryService(() =>
      DateTime.fromISO('2026-07-16T21:00:00.000Z', { zone: 'utc' })
    ).findForOwner(owner.id, created.adventureId)

    const pending = await db
      .from('adventures')
      .where('id', created.adventureId)
      .select('last_played_at')
      .firstOrFail()
    assert.equal(new Date(pending.last_played_at).toISOString(), original.toISOString())
  })
})
