import Character from '#models/character'
import Location from '#models/location'
import StartingPoint from '#models/starting_point'
import User from '#models/user'
import World, { type WorldVisibility } from '#models/world'
import WorldVersion from '#models/world_version'
import AdventureCreationService from '#services/adventure_creation_service'
import { publishWorldVersion } from '#services/world_version_publication_service'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'
import { createHash } from 'node:crypto'

type CreationError = Error & {
  code?: string
  status?: number
  fields?: Record<string, string[]>
}

const player = {
  name: 'Mara Venn',
  physicalDescription: 'A rain-dark coat and a silver scar across one palm.',
  backstory: 'Mara came to the chapel looking for her missing brother.',
}

async function captureError(action: () => Promise<unknown>) {
  try {
    await action()
  } catch (error) {
    return error as CreationError
  }

  throw new Error('Expected Adventure creation to fail.')
}

async function createUser(email: string) {
  return User.create({ email, password: 'correct horse battery staple' })
}

async function createWorld({
  authorId,
  slug,
  visibility = 'private',
  publish = true,
  defaultStartingPoint = true,
  includeCharacter = false,
}: {
  authorId: number
  slug: string
  visibility?: WorldVisibility
  publish?: boolean
  defaultStartingPoint?: boolean
  includeCharacter?: boolean
}) {
  const world = await World.create({
    authorId,
    slug,
    name: slug
      .split('-')
      .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
      .join(' '),
    description: 'A focused Adventure creation fixture.',
    visibility,
    adventureGuidance: 'Keep the opening grounded in the frozen source.',
  })
  const location = await Location.create({
    worldId: world.id,
    key: 'chapel-threshold',
    name: 'Chapel Threshold',
    description: 'Rain runs down the locked chapel doors.',
    sortOrder: 0,
  })
  const character = includeCharacter
    ? await Character.create({
        worldId: world.id,
        locationId: location.id,
        key: 'rain-warden',
        name: 'Rain Warden',
        physicalDescription: 'A watchful warden in a soaked oilskin cloak.',
        background: 'The warden has guarded the chapel threshold through every storm.',
        personality: 'Measured and vigilant.',
        voice: 'Brief and practical.',
        privateKnowledge: 'The threshold ward weakens when the bell rings.',
        initialMood: 'Alert but uneasy.',
        initialStatus: 'Watching the locked chapel doors.',
        initialMemory: 'The warden has not yet spoken with the player.',
        sortOrder: 0,
      })
    : null

  await StartingPoint.create({
    worldId: world.id,
    locationId: location.id,
    key: 'chapel-arrival',
    name: 'Chapel Arrival',
    openingPremise: 'The chapel bell rings although no one is inside.',
    sortOrder: 0,
    isDefault: defaultStartingPoint,
  })

  const version = publish ? await publishWorldVersion(world.id) : null
  return { world, location, version, character }
}

function creationInput(
  ownerId: number,
  worldSlug: string,
  creationRequestId: string,
  overrides: Record<string, unknown> = {}
) {
  return {
    ownerId,
    worldSlug,
    creationRequestId,
    player,
    ...overrides,
  }
}

test.group('AdventureCreationService', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('LC-003/S1/R1-S1 + R2-S1 + R4-S2: creates one pending Adventure aggregate with frozen initial NPC state from the current default Starting Point', async ({
    assert,
  }) => {
    const owner = await createUser('adventure-create-owner@example.com')
    const { world, version, character } = await createWorld({
      authorId: owner.id,
      slug: 'adventure-create-world',
      includeCharacter: true,
    })
    const service = new AdventureCreationService()
    const requestId = '11111111-1111-4111-8111-111111111111'

    const result = await service.create(creationInput(owner.id, world.slug, requestId))

    const adventure = await db.from('adventures').where('id', result.adventureId).firstOrFail()
    const persistedPlayer = await db
      .from('adventure_players')
      .where('adventure_id', result.adventureId)
      .firstOrFail()
    const job = await db
      .from('adventure_jobs')
      .where('adventure_id', result.adventureId)
      .firstOrFail()
    const characterStates = await db
      .from('adventure_character_states')
      .where('adventure_id', result.adventureId)
      .select('character_key', 'current_location_key', 'mood', 'status', 'memory')

    assert.equal(result.status, 'opening_pending')
    assert.equal(result.route, `/adventures/${result.adventureId}`)
    assert.deepInclude(adventure, {
      owner_id: owner.id,
      world_id: world.id,
      world_version_id: version!.id,
      starting_point_key: 'chapel-arrival',
      creation_request_id: requestId,
      status: 'opening_pending',
      generation: 1,
      turn_count: 0,
    })
    assert.isNull(adventure.head_revision_id)
    assert.deepInclude(persistedPlayer, {
      adventure_id: result.adventureId,
      ...{
        name: player.name,
        physical_description: player.physicalDescription,
        backstory: player.backstory,
      },
      current_location_key: 'chapel-threshold',
    })
    assert.deepInclude(job, {
      adventure_id: result.adventureId,
      generation: 1,
      type: 'opening',
      status: 'pending',
      attempt_count: 0,
    })
    assert.deepEqual(characterStates, [
      {
        character_key: character!.key,
        current_location_key: 'chapel-threshold',
        mood: 'Alert but uneasy.',
        status: 'Watching the locked chapel doors.',
        memory: 'The warden has not yet spoken with the player.',
      },
    ])
  })

  test('LC-003/S1/R2-S1: derives nonblank Adventure state from a legacy blank frozen snapshot without changing that source', async ({
    assert,
  }) => {
    const owner = await createUser('legacy-snapshot-create-owner@example.com')
    const { world, version } = await createWorld({
      authorId: owner.id,
      slug: 'legacy-snapshot-create-world',
      includeCharacter: true,
    })
    const legacySnapshot = structuredClone(version!.snapshot)
    legacySnapshot.characters[0].initialMood = ''
    legacySnapshot.characters[0].initialStatus = ' \t '
    legacySnapshot.characters[0].initialMemory = undefined
    const legacyVersion = await WorldVersion.create({
      worldId: world.id,
      ordinal: version!.ordinal + 1,
      schemaVersion: version!.schemaVersion,
      contentHash: createHash('sha256').update(JSON.stringify(legacySnapshot)).digest('hex'),
      snapshot: legacySnapshot,
    })
    await db.from('worlds').where('id', world.id).update({ current_version_id: legacyVersion.id })

    const result = await new AdventureCreationService().create(
      creationInput(owner.id, world.slug, '12121212-1212-4121-8121-121212121212')
    )

    const state = await db
      .from('adventure_character_states')
      .where('adventure_id', result.adventureId)
      .firstOrFail()
    const frozenSource = await db.from('world_versions').where('id', legacyVersion.id).firstOrFail()

    assert.deepInclude(state, {
      mood: 'No current mood has been recorded yet.',
      status: 'No current status has been recorded yet.',
      memory: 'No interactions with the player have been recorded yet.',
    })
    const frozenCharacter = (frozenSource.snapshot as typeof legacySnapshot).characters[0]
    assert.deepInclude(frozenCharacter, { initialMood: '', initialStatus: ' \t ' })
    assert.notProperty(frozenCharacter, 'initialMemory')
  })

  test('LC-003/S1/R1-S2: owner-scoped idempotency replays the result without duplicates', async ({
    assert,
  }) => {
    const author = await createUser('idempotency-author@example.com')
    const firstOwner = await createUser('idempotency-first-owner@example.com')
    const secondOwner = await createUser('idempotency-second-owner@example.com')
    const { world } = await createWorld({
      authorId: author.id,
      slug: 'idempotency-world',
      visibility: 'public',
    })
    const service = new AdventureCreationService()
    const requestId = '22222222-2222-4222-8222-222222222222'

    const first = await service.create(creationInput(firstOwner.id, world.slug, requestId))
    const replay = await service.create(creationInput(firstOwner.id, world.slug, requestId))
    const otherOwner = await service.create(creationInput(secondOwner.id, world.slug, requestId))

    assert.deepEqual(replay, first)
    assert.notEqual(otherOwner.adventureId, first.adventureId)
    assert.lengthOf(
      await db
        .from('adventures')
        .where('owner_id', firstOwner.id)
        .where('creation_request_id', requestId),
      1
    )
    assert.lengthOf(
      await db
        .from('adventure_players')
        .whereIn('adventure_id', [first.adventureId, otherOwner.adventureId]),
      2
    )
    assert.lengthOf(
      await db
        .from('adventure_jobs')
        .whereIn('adventure_id', [first.adventureId, otherOwner.adventureId]),
      2
    )
  })

  test('LC-003/S1/R1-S3: public and owner-private Worlds are accessible while another owner private World is not found', async ({
    assert,
  }) => {
    const owner = await createUser('access-owner@example.com')
    const otherAuthor = await createUser('access-other-author@example.com')
    const publicSource = await createWorld({
      authorId: otherAuthor.id,
      slug: 'accessible-public-world',
      visibility: 'public',
    })
    const privateSource = await createWorld({
      authorId: owner.id,
      slug: 'accessible-private-world',
    })
    const inaccessibleSource = await createWorld({
      authorId: otherAuthor.id,
      slug: 'inaccessible-private-world',
    })
    const service = new AdventureCreationService()

    await service.create(
      creationInput(owner.id, publicSource.world.slug, '33333333-3333-4333-8333-333333333333')
    )
    await service.create(
      creationInput(owner.id, privateSource.world.slug, '44444444-4444-4444-8444-444444444444')
    )
    const error = await captureError(() =>
      service.create(
        creationInput(
          owner.id,
          inaccessibleSource.world.slug,
          '55555555-5555-4555-8555-555555555555'
        )
      )
    )

    assert.equal(error.code, 'WORLD_NOT_FOUND')
    assert.equal(error.status, 404)
    assert.lengthOf(await db.from('adventures').where('owner_id', owner.id), 2)
    assert.lengthOf(await db.from('adventures').where('world_id', inaccessibleSource.world.id), 0)
  })

  test('LC-003/S1/R2-S3: missing current version or default valid Starting Point is unplayable', async ({
    assert,
  }) => {
    const owner = await createUser('unplayable-owner@example.com')
    const missingVersion = await createWorld({
      authorId: owner.id,
      slug: 'missing-current-version',
      publish: false,
    })
    const missingDefault = await createWorld({
      authorId: owner.id,
      slug: 'missing-default-start',
      defaultStartingPoint: false,
    })
    const service = new AdventureCreationService()

    for (const [source, requestId] of [
      [missingVersion.world, '66666666-6666-4666-8666-666666666666'],
      [missingDefault.world, '77777777-7777-4777-8777-777777777777'],
    ] as const) {
      const error = await captureError(() =>
        service.create(creationInput(owner.id, source.slug, requestId))
      )

      assert.equal(error.code, 'WORLD_NOT_PLAYABLE')
      assert.equal(error.status, 409)
    }

    assert.lengthOf(await db.from('adventures').where('owner_id', owner.id), 0)
  })

  test('LC-003/S1/R1-S2: invalid profile fields are rejected before writes', async ({ assert }) => {
    const owner = await createUser('invalid-profile-owner@example.com')
    const { world } = await createWorld({ authorId: owner.id, slug: 'invalid-profile-world' })
    const service = new AdventureCreationService()
    const requestId = '88888888-8888-4888-8888-888888888888'

    const error = await captureError(() =>
      service.create(
        creationInput(owner.id, world.slug, requestId, {
          player: {
            name: '   ',
            physicalDescription: 'p'.repeat(2_001),
            backstory: 'b'.repeat(8_001),
          },
        })
      )
    )

    assert.equal(error.code, 'INVALID_PROFILE')
    assert.equal(error.status, 422)
    assert.property(error.fields ?? {}, 'name')
    assert.property(error.fields ?? {}, 'physicalDescription')
    assert.property(error.fields ?? {}, 'backstory')
    assert.lengthOf(
      await db
        .from('adventures')
        .where('owner_id', owner.id)
        .where('creation_request_id', requestId),
      0
    )
    assert.lengthOf(
      await db
        .from('adventure_players as players')
        .join('adventures', 'adventures.id', 'players.adventure_id')
        .where('adventures.owner_id', owner.id)
        .where('adventures.creation_request_id', requestId),
      0
    )
    assert.lengthOf(
      await db
        .from('adventure_jobs as jobs')
        .join('adventures', 'adventures.id', 'jobs.adventure_id')
        .where('adventures.owner_id', owner.id)
        .where('adventures.creation_request_id', requestId),
      0
    )
  })

  test('LC-003/S1/R1-S1: a failed creation rolls back Adventure, player, and job atomically', async ({
    assert,
  }) => {
    const owner = await createUser('rollback-owner@example.com')
    const { world } = await createWorld({ authorId: owner.id, slug: 'rollback-world' })
    const service = new AdventureCreationService()
    const requestId = '99999999-9999-4999-8999-999999999999'

    await db.rawQuery(`
      CREATE FUNCTION lc003_reject_opening_job_for_test()
      RETURNS trigger
      LANGUAGE plpgsql
      AS $$
      BEGIN
        RAISE EXCEPTION 'forced opening job failure';
      END;
      $$
    `)
    await db.rawQuery(`
      CREATE TRIGGER lc003_reject_opening_job_for_test
      BEFORE INSERT ON adventure_jobs
      FOR EACH ROW EXECUTE FUNCTION lc003_reject_opening_job_for_test()
    `)

    await captureError(() => service.create(creationInput(owner.id, world.slug, requestId)))

    assert.lengthOf(
      await db
        .from('adventures')
        .where('owner_id', owner.id)
        .where('creation_request_id', requestId),
      0
    )
    assert.lengthOf(
      await db
        .from('adventure_players as players')
        .join('adventures', 'adventures.id', 'players.adventure_id')
        .where('adventures.owner_id', owner.id)
        .where('adventures.creation_request_id', requestId),
      0
    )
    assert.lengthOf(
      await db
        .from('adventure_jobs as jobs')
        .join('adventures', 'adventures.id', 'jobs.adventure_id')
        .where('adventures.owner_id', owner.id)
        .where('adventures.creation_request_id', requestId),
      0
    )
  })
})
