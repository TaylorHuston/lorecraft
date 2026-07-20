import AdventureCreationService from '#services/adventure_creation_service'
import AdventureLifecycleService from '#services/adventure_lifecycle_service'
import Character from '#models/character'
import Location from '#models/location'
import StartingPoint from '#models/starting_point'
import User from '#models/user'
import World, { type WorldVisibility } from '#models/world'
import WorldVersion from '#models/world_version'
import { publishWorldVersion } from '#services/world_version_publication_service'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'
import { createHash } from 'node:crypto'

const player = {
  name: 'Mara Venn',
  physicalDescription: 'A rain-dark coat and a silver scar across one palm.',
  backstory: 'Mara came to the chapel looking for her missing brother.',
}

type LifecycleError = Error & {
  code?: string
  status?: number
}

async function captureError(action: () => Promise<unknown>) {
  try {
    await action()
  } catch (error) {
    return error as LifecycleError
  }

  throw new Error('Expected Adventure lifecycle action to fail.')
}

async function createUser(email: string) {
  return User.create({ email, password: 'correct horse battery staple' })
}

async function createWorld({
  authorId,
  slug,
  visibility = 'private',
}: {
  authorId: number
  slug: string
  visibility?: WorldVisibility
}) {
  const world = await World.create({
    authorId,
    slug,
    name: slug
      .split('-')
      .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
      .join(' '),
    description: 'A focused Adventure lifecycle fixture.',
    visibility,
    adventureGuidance: 'Keep the opening grounded in the frozen source.',
  })
  const chapel = await Location.create({
    worldId: world.id,
    key: 'chapel-threshold',
    name: 'Chapel Threshold',
    description: 'Rain runs down the locked chapel doors.',
    sortOrder: 0,
  })
  const market = await Location.create({
    worldId: world.id,
    key: 'market-square',
    name: 'Market Square',
    description: 'Lanterns shiver above the empty market.',
    sortOrder: 1,
  })
  const character = await Character.create({
    worldId: world.id,
    locationId: chapel.id,
    key: 'mira',
    name: 'Mira',
    physicalDescription: 'A local woman in practical rain-dark clothes.',
    background: 'Mira has watched the chapel through many storms.',
    personality: 'Cautious and observant.',
    voice: 'Quiet and measured.',
    privateKnowledge: 'The bell has no rope.',
    initialMood: 'Uneasy but resolute.',
    initialStatus: 'Watching the chapel threshold.',
    initialMemory: 'Mira has not yet spoken with the player.',
    sortOrder: 0,
  })
  const startingPoint = await StartingPoint.create({
    worldId: world.id,
    locationId: chapel.id,
    key: 'chapel-arrival',
    name: 'Chapel Arrival',
    openingPremise: 'The chapel bell rings although no one is inside.',
    sortOrder: 0,
    isDefault: true,
  })
  const version = await publishWorldVersion(world.id)

  return { world, chapel, market, character, startingPoint, version }
}

async function createAdventure(ownerId: number, worldSlug: string, requestId: string) {
  return new AdventureCreationService().create({
    ownerId,
    worldSlug,
    creationRequestId: requestId,
    player,
  })
}

async function makeAdventureReady(adventureId: string) {
  const now = new Date()
  const job = await db
    .from('adventure_jobs')
    .where('adventure_id', adventureId)
    .select('id')
    .firstOrFail()

  await db.from('adventure_jobs').where('id', job.id).update({
    status: 'succeeded',
    attempt_count: 1,
    updated_at: now,
  })
  await db.table('model_calls').insert({
    adventure_id: adventureId,
    job_id: job.id,
    operation: 'opening_generation',
    request_metadata: { byteCount: 100, timeoutMs: 1_000 },
    response_metadata: { byteCount: 34, statusCode: 200 },
    provider: 'test',
    model: 'test-model',
    settings: {},
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
  const [revision] = await db
    .table('adventure_revisions')
    .insert({
      adventure_id: adventureId,
      sequence: 0,
      kind: 'opening',
      parent_revision_id: null,
      created_at: now,
    })
    .returning(['id'])
  await db.table('adventure_story_entries').insert({
    adventure_id: adventureId,
    revision_id: revision.id,
    sequence: 0,
    kind: 'narration',
    content: 'The chapel doors open into rain.',
    created_at: now,
  })
  await db.from('adventure_players').where('adventure_id', adventureId).update({
    status: 'Wounded and exhausted.',
    current_location_key: 'market-square',
    updated_at: now,
  })
  await db.from('adventures').where('id', adventureId).update({
    status: 'ready',
    turn_count: 4,
    head_revision_id: revision.id,
    updated_at: now,
  })
}

test.group('AdventureLifecycleService', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('LC-003/S1/R4-S2 + S2/R4-S6: reset restores populated frozen player and NPC state and removes completed-turn lineage', async ({
    assert,
  }) => {
    const owner = await createUser('lifecycle-reset-owner@example.com')
    const source = await createWorld({ authorId: owner.id, slug: 'lifecycle-reset-world' })
    const created = await createAdventure(
      owner.id,
      source.world.slug,
      '11111111-1111-4111-8111-111111111111'
    )
    await makeAdventureReady(created.adventureId)

    const opening = await db
      .from('adventure_revisions')
      .where('adventure_id', created.adventureId)
      .where('kind', 'opening')
      .firstOrFail()
    const completedAt = new Date()
    const [turnRevision] = await db
      .table('adventure_revisions')
      .insert({
        adventure_id: created.adventureId,
        sequence: 1,
        kind: 'turn',
        parent_revision_id: opening.id,
        created_at: completedAt,
      })
      .returning(['id'])
    const [turn] = await db
      .table('adventure_turns')
      .insert({
        adventure_id: created.adventureId,
        request_id: '99999999-9999-4999-8999-999999999999',
        trigger: 'act',
        input: 'I ask Mira what she remembers.',
        status: 'succeeded',
        source_revision_id: opening.id,
        result_revision_id: turnRevision.id,
        created_at: completedAt,
        updated_at: completedAt,
      })
      .returning(['id'])
    await db.table('adventure_jobs').insert({
      adventure_id: created.adventureId,
      turn_id: turn.id,
      generation: 1,
      type: 'turn',
      status: 'succeeded',
      attempt_count: 1,
      available_at: completedAt,
      lease_owner: null,
      lease_expires_at: null,
      failure_code: null,
      failure_message: null,
      created_at: completedAt,
      updated_at: completedAt,
    })
    await db.table('adventure_story_entries').insert({
      adventure_id: created.adventureId,
      revision_id: turnRevision.id,
      sequence: 0,
      kind: 'narration',
      content: 'Mira leads you into the market square.',
      created_at: completedAt,
    })
    await db.table('adventure_revision_mutations').insert({
      adventure_id: created.adventureId,
      revision_id: turnRevision.id,
      sequence: 0,
      accepted: true,
      actor_type: 'character',
      actor_key: source.character.key,
      field: 'memory',
      previous_value: '',
      resulting_value: 'Mira heard the bell answer from below.',
      rejection_code: null,
      created_at: completedAt,
    })
    await db
      .from('adventure_character_states')
      .where('adventure_id', created.adventureId)
      .where('character_key', source.character.key)
      .update({
        current_location_key: source.market.key,
        mood: 'afraid',
        status: 'keeping the secret',
        memory: 'Mira heard the bell answer from below.',
        updated_at: completedAt,
      })
    await db.from('adventures').where('id', created.adventureId).update({
      head_revision_id: turnRevision.id,
      turn_count: 1,
      updated_at: completedAt,
    })

    source.startingPoint.locationId = source.market.id
    source.startingPoint.openingPremise = 'The market clock strikes thirteen.'
    await source.startingPoint.save()
    const newerVersion = await publishWorldVersion(source.world.id)

    const result = await new AdventureLifecycleService().reset(created.adventureId, owner.id)

    const adventure = await db.from('adventures').where('id', created.adventureId).firstOrFail()
    const persistedPlayer = await db
      .from('adventure_players')
      .where('adventure_id', created.adventureId)
      .firstOrFail()
    const jobs = await db.from('adventure_jobs').where('adventure_id', created.adventureId)
    const characterStates = await db
      .from('adventure_character_states')
      .where('adventure_id', created.adventureId)

    assert.deepEqual(result, {
      adventureId: created.adventureId,
      status: 'opening_pending',
      generation: 2,
    })
    assert.notEqual(newerVersion.id, source.version.id)
    assert.deepInclude(adventure, {
      owner_id: owner.id,
      world_id: source.world.id,
      world_version_id: source.version.id,
      starting_point_key: source.startingPoint.key,
      creation_request_id: '11111111-1111-4111-8111-111111111111',
      status: 'opening_pending',
      generation: 2,
      turn_count: 0,
    })
    assert.isNull(adventure.head_revision_id)
    assert.deepInclude(persistedPlayer, {
      name: player.name,
      physical_description: player.physicalDescription,
      backstory: player.backstory,
      status: '',
      current_location_key: source.chapel.key,
    })
    assert.lengthOf(jobs, 1)
    assert.deepInclude(jobs[0], {
      generation: 2,
      type: 'opening',
      status: 'pending',
      attempt_count: 0,
      lease_owner: null,
      lease_expires_at: null,
      failure_code: null,
      failure_message: null,
    })
    assert.lengthOf(await db.from('model_calls').where('adventure_id', created.adventureId), 0)
    assert.lengthOf(
      await db.from('adventure_revisions').where('adventure_id', created.adventureId),
      0
    )
    assert.lengthOf(
      await db.from('adventure_story_entries').where('adventure_id', created.adventureId),
      0
    )
    assert.lengthOf(await db.from('adventure_turns').where('adventure_id', created.adventureId), 0)
    assert.lengthOf(
      await db.from('adventure_revision_mutations').where('adventure_id', created.adventureId),
      0
    )
    assert.lengthOf(characterStates, source.version.snapshot.characters.length)
    assert.deepInclude(characterStates[0], {
      character_key: source.character.key,
      current_location_key: source.chapel.key,
      mood: 'Uneasy but resolute.',
      status: 'Watching the chapel threshold.',
      memory: 'Mira has not yet spoken with the player.',
    })
    assert.isNotNull(await db.from('worlds').where('id', source.world.id).first())
    const persistedWorld = await db.from('worlds').where('id', source.world.id).firstOrFail()
    assert.equal(persistedWorld.current_version_id, newerVersion.id)
    assert.lengthOf(await db.from('world_versions').where('world_id', source.world.id), 2)
  })

  test('LC-003/S1/R4-S2: reset derives nonblank state from a legacy blank frozen snapshot without rewriting it', async ({
    assert,
  }) => {
    const owner = await createUser('legacy-snapshot-reset-owner@example.com')
    const source = await createWorld({ authorId: owner.id, slug: 'legacy-snapshot-reset-world' })
    const legacySnapshot = structuredClone(source.version.snapshot)
    legacySnapshot.characters[0].initialMood = ''
    legacySnapshot.characters[0].initialStatus = '\n'
    legacySnapshot.characters[0].initialMemory = undefined
    const legacyVersion = await WorldVersion.create({
      worldId: source.world.id,
      ordinal: source.version.ordinal + 1,
      schemaVersion: source.version.schemaVersion,
      contentHash: createHash('sha256').update(JSON.stringify(legacySnapshot)).digest('hex'),
      snapshot: legacySnapshot,
    })
    await db
      .from('worlds')
      .where('id', source.world.id)
      .update({ current_version_id: legacyVersion.id })
    const created = await createAdventure(
      owner.id,
      source.world.slug,
      '13131313-1313-4131-8131-131313131313'
    )
    await makeAdventureReady(created.adventureId)

    await new AdventureLifecycleService().reset(created.adventureId, owner.id)

    const state = await db
      .from('adventure_character_states')
      .where('adventure_id', created.adventureId)
      .firstOrFail()
    const frozenSource = await db.from('world_versions').where('id', legacyVersion.id).firstOrFail()

    assert.deepInclude(state, {
      mood: 'No current mood has been recorded yet.',
      status: 'No current status has been recorded yet.',
      memory: 'No interactions with the player have been recorded yet.',
    })
    const frozenCharacter = (frozenSource.snapshot as typeof legacySnapshot).characters[0]
    assert.deepInclude(frozenCharacter, { initialMood: '', initialStatus: '\n' })
    assert.notProperty(frozenCharacter, 'initialMemory')
  })

  test('LC-003/S1/R4-S2: reset returns conflict while an opening job is active', async ({
    assert,
  }) => {
    const owner = await createUser('lifecycle-busy-owner@example.com')
    const source = await createWorld({ authorId: owner.id, slug: 'lifecycle-busy-world' })
    const created = await createAdventure(
      owner.id,
      source.world.slug,
      '22222222-2222-4222-8222-222222222222'
    )
    await db.from('adventures').where('id', created.adventureId).update({ status: 'ready' })

    const error = await captureError(() =>
      new AdventureLifecycleService().reset(created.adventureId, owner.id)
    )

    assert.equal(error.code, 'ADVENTURE_BUSY')
    assert.equal(error.status, 409)
    assert.deepInclude(await db.from('adventures').where('id', created.adventureId).firstOrFail(), {
      status: 'ready',
      generation: 1,
      turn_count: 0,
    })
    assert.lengthOf(
      await db
        .from('adventure_jobs')
        .where('adventure_id', created.adventureId)
        .where('status', 'pending'),
      1
    )
  })

  test('LC-003/S1/R1-S3 + R4-S2: reset does not disclose another owner Adventure', async ({
    assert,
  }) => {
    const owner = await createUser('lifecycle-private-owner@example.com')
    const otherOwner = await createUser('lifecycle-private-other@example.com')
    const source = await createWorld({ authorId: owner.id, slug: 'lifecycle-private-world' })
    const created = await createAdventure(
      owner.id,
      source.world.slug,
      '33333333-3333-4333-8333-333333333333'
    )
    await makeAdventureReady(created.adventureId)
    const service = new AdventureLifecycleService()

    const crossOwner = await captureError(() => service.reset(created.adventureId, otherOwner.id))
    const missing = await captureError(() =>
      service.reset('44444444-4444-4444-8444-444444444444', otherOwner.id)
    )

    for (const error of [crossOwner, missing]) {
      assert.equal(error.code, 'ADVENTURE_NOT_FOUND')
      assert.equal(error.status, 404)
      assert.equal(error.message, 'Adventure not found.')
    }
    assert.deepInclude(await db.from('adventures').where('id', created.adventureId).firstOrFail(), {
      owner_id: owner.id,
      status: 'ready',
      generation: 1,
      turn_count: 4,
    })
  })

  test('LC-003/S1/R1-S3 + R4-S3: delete removes only the selected owner aggregate', async ({
    assert,
  }) => {
    const owner = await createUser('lifecycle-delete-owner@example.com')
    const otherOwner = await createUser('lifecycle-delete-other@example.com')
    const source = await createWorld({
      authorId: owner.id,
      slug: 'lifecycle-delete-world',
      visibility: 'public',
    })
    const target = await createAdventure(
      owner.id,
      source.world.slug,
      '55555555-5555-4555-8555-555555555555'
    )
    const sibling = await createAdventure(
      owner.id,
      source.world.slug,
      '66666666-6666-4666-8666-666666666666'
    )
    const otherAdventure = await createAdventure(
      otherOwner.id,
      source.world.slug,
      '77777777-7777-4777-8777-777777777777'
    )
    await makeAdventureReady(target.adventureId)
    const service = new AdventureLifecycleService()

    const crossOwner = await captureError(() => service.delete(target.adventureId, otherOwner.id))
    const missing = await captureError(() =>
      service.delete('88888888-8888-4888-8888-888888888888', otherOwner.id)
    )
    for (const error of [crossOwner, missing]) {
      assert.equal(error.code, 'ADVENTURE_NOT_FOUND')
      assert.equal(error.status, 404)
      assert.equal(error.message, 'Adventure not found.')
    }

    await service.delete(target.adventureId, owner.id)

    assert.isNull(await db.from('adventures').where('id', target.adventureId).first())
    for (const table of [
      'adventure_players',
      'adventure_jobs',
      'model_calls',
      'adventure_revisions',
      'adventure_story_entries',
    ]) {
      assert.lengthOf(await db.from(table).where('adventure_id', target.adventureId), 0)
    }
    assert.isNotNull(await db.from('adventures').where('id', sibling.adventureId).first())
    assert.isNotNull(await db.from('adventures').where('id', otherAdventure.adventureId).first())
    assert.isNotNull(await db.from('worlds').where('id', source.world.id).first())
    assert.isNotNull(await db.from('world_versions').where('id', source.version.id).first())
  })

  test('LC-003/S1/R3-S3: an owner can retry a terminal opening failure against the same source', async ({
    assert,
  }) => {
    const owner = await createUser('lifecycle-retry-owner@example.com')
    const otherOwner = await createUser('lifecycle-retry-other@example.com')
    const source = await createWorld({ authorId: owner.id, slug: 'lifecycle-retry-world' })
    const created = await createAdventure(
      owner.id,
      source.world.slug,
      '99999999-9999-4999-8999-999999999999'
    )
    await db.from('adventure_jobs').where('adventure_id', created.adventureId).update({
      status: 'failed',
      attempt_count: 2,
      failure_code: 'provider_failure',
      failure_message: 'Opening generation failed.',
      updated_at: new Date(),
    })
    await db.from('adventures').where('id', created.adventureId).update({
      status: 'opening_failed',
      updated_at: new Date(),
    })
    const service = new AdventureLifecycleService()

    const missing = await captureError(() =>
      service.retryOpening(created.adventureId, otherOwner.id)
    )
    const result = await service.retryOpening(created.adventureId, owner.id)

    assert.equal(missing.code, 'ADVENTURE_NOT_FOUND')
    assert.deepEqual(result, {
      adventureId: created.adventureId,
      status: 'opening_pending',
      generation: 1,
    })
    const adventure = await db.from('adventures').where('id', created.adventureId).firstOrFail()
    assert.deepInclude(adventure, {
      world_version_id: source.version.id,
      starting_point_key: source.startingPoint.key,
      status: 'opening_pending',
      generation: 1,
      turn_count: 0,
    })
    const jobs = await db
      .from('adventure_jobs')
      .where('adventure_id', created.adventureId)
      .orderBy('created_at')
    assert.lengthOf(jobs, 2)
    assert.equal(jobs[0].status, 'failed')
    assert.deepInclude(jobs[1], {
      generation: 1,
      type: 'opening',
      status: 'pending',
      attempt_count: 0,
    })
  })
})
