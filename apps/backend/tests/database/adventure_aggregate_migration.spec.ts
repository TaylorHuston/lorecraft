import { test } from '@japa/runner'
import type { QueryClientContract } from '@adonisjs/lucid/types/database'
import CreateUsers from '../../database/migrations/1761885935168_create_users_table.js'
import CreateWorldCatalog from '../../database/migrations/1784053200000_create_world_catalog_tables.js'
import EnforceCharacterLocationWorldIntegrity from '../../database/migrations/1784060400000_enforce_character_location_world_integrity.js'
import AddWorldSeedIdentity from '../../database/migrations/1784146800000_add_world_seed_identity.js'
import AddFrozenWorldSourceFoundation from '../../database/migrations/1784233200000_add_frozen_world_source_foundation.js'
import CreateAdventureAggregate from '../../database/migrations/1784236800000_create_adventure_aggregate.js'
import AddDurableAdventureTurns from '../../database/migrations/1784409600000_add_durable_adventure_turns.js'
import {
  rollbackMigration,
  runMigration,
  withIsolatedMigrationDatabase,
} from '../helpers/migration_database.js'

const migrationName = '1784236800000_create_adventure_aggregate'
const durableTurnsMigrationName = '1784409600000_add_durable_adventure_turns'
const createdAt = new Date('2026-01-01T00:00:00.000Z')

async function createAdventureSourceFixture(client: QueryClientContract) {
  await runMigration(client, CreateUsers, '1761885935168_create_users_table')
  await runMigration(client, CreateWorldCatalog, '1784053200000_create_world_catalog_tables')
  await runMigration(
    client,
    EnforceCharacterLocationWorldIntegrity,
    '1784060400000_enforce_character_location_world_integrity'
  )
  await runMigration(client, AddWorldSeedIdentity, '1784146800000_add_world_seed_identity')
  await runMigration(
    client,
    AddFrozenWorldSourceFoundation,
    '1784233200000_add_frozen_world_source_foundation'
  )

  const owners = await client
    .table('users')
    .multiInsert([
      {
        email: 'adventure-owner-one@example.com',
        full_name: null,
        password: 'not-a-real-password-hash',
        created_at: createdAt,
      },
      {
        email: 'adventure-owner-two@example.com',
        full_name: null,
        password: 'not-a-real-password-hash',
        created_at: createdAt,
      },
    ])
    .returning(['id', 'email'])
  const worlds = await client
    .table('worlds')
    .multiInsert([
      {
        author_id: owners[0].id,
        slug: 'first-adventure-world',
        name: 'First Adventure World',
        description: 'The first frozen Adventure source.',
        visibility: 'private',
        adventure_guidance: 'Keep the opening grounded.',
        created_at: createdAt,
      },
      {
        author_id: owners[1].id,
        slug: 'second-adventure-world',
        name: 'Second Adventure World',
        description: 'A different frozen Adventure source.',
        visibility: 'private',
        adventure_guidance: 'Use a different opening.',
        created_at: createdAt,
      },
    ])
    .returning(['id', 'slug'])
  const versions = await client
    .table('world_versions')
    .multiInsert(
      worlds.map((world) => ({
        world_id: world.id,
        ordinal: 1,
        schema_version: 1,
        content_hash: world.slug === 'first-adventure-world' ? 'a'.repeat(64) : 'b'.repeat(64),
        snapshot: {
          schemaVersion: 1,
          world: { slug: world.slug },
          locations: [],
          characters: [],
          startingPoints: [],
        },
        created_at: createdAt,
      }))
    )
    .returning(['id', 'world_id'])

  return {
    firstOwnerId: owners[0].id,
    secondOwnerId: owners[1].id,
    firstWorldId: worlds[0].id,
    secondWorldId: worlds[1].id,
    firstVersionId: versions.find((version) => version.world_id === worlds[0].id)!.id,
    secondVersionId: versions.find((version) => version.world_id === worlds[1].id)!.id,
  }
}

function adventureRecord(
  fixture: Awaited<ReturnType<typeof createAdventureSourceFixture>>,
  overrides: Record<string, unknown> = {}
) {
  return {
    owner_id: fixture.firstOwnerId,
    world_id: fixture.firstWorldId,
    world_version_id: fixture.firstVersionId,
    starting_point_key: 'chapel-threshold',
    creation_request_id: '11111111-1111-4111-8111-111111111111',
    status: 'opening_pending',
    generation: 1,
    turn_count: 0,
    last_played_at: createdAt,
    created_at: createdAt,
    ...overrides,
  }
}

test.group('Adventure aggregate database migration', () => {
  test('LC-003/S1/R1-S2 + R2-S1: Adventure identity is owner-idempotent and bound to one WorldVersion', async ({
    assert,
  }) => {
    await withIsolatedMigrationDatabase(async (client) => {
      const fixture = await createAdventureSourceFixture(client)
      await runMigration(client, CreateAdventureAggregate, migrationName)

      const [adventure] = await client
        .table('adventures')
        .insert(adventureRecord(fixture))
        .returning(['id'])

      assert.match(
        adventure.id,
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      )

      await assert.rejects(
        () => client.table('adventures').insert(adventureRecord(fixture)),
        /adventures_owner_id_creation_request_id_unique/
      )

      await client.table('adventures').insert(
        adventureRecord(fixture, {
          owner_id: fixture.secondOwnerId,
        })
      )

      await assert.rejects(
        () =>
          client.table('adventures').insert(
            adventureRecord(fixture, {
              creation_request_id: '22222222-2222-4222-8222-222222222222',
              world_version_id: fixture.secondVersionId,
            })
          ),
        /adventures_world_version_world_foreign/
      )
    })
  })

  test('LC-003/S1/R1-S1: an Adventure owns one bounded player profile', async ({ assert }) => {
    await withIsolatedMigrationDatabase(async (client) => {
      const fixture = await createAdventureSourceFixture(client)
      await runMigration(client, CreateAdventureAggregate, migrationName)

      const adventures = await client
        .table('adventures')
        .multiInsert(
          Array.from({ length: 6 }, (_, index) =>
            adventureRecord(fixture, {
              creation_request_id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
            })
          )
        )
        .returning(['id'])
      const validProfile = {
        adventure_id: adventures[0].id,
        name: 'n'.repeat(100),
        physical_description: 'p'.repeat(2_000),
        backstory: 'b'.repeat(8_000),
        status: 's'.repeat(1_000),
        current_location_key: 'chapel-threshold',
        created_at: createdAt,
      }

      await client.table('adventure_players').insert(validProfile)

      await assert.rejects(
        () => client.table('adventure_players').insert(validProfile),
        /adventure_players_pkey/
      )
      await assert.rejects(
        () =>
          client.table('adventure_players').insert({
            ...validProfile,
            adventure_id: adventures[1].id,
            name: 'n'.repeat(101),
          }),
        /value too long for type character varying\(100\)/
      )
      await assert.rejects(
        () =>
          client.table('adventure_players').insert({
            ...validProfile,
            adventure_id: adventures[2].id,
            physical_description: 'p'.repeat(2_001),
          }),
        /value too long for type character varying\(2000\)/
      )
      await assert.rejects(
        () =>
          client.table('adventure_players').insert({
            ...validProfile,
            adventure_id: adventures[3].id,
            backstory: 'b'.repeat(8_001),
          }),
        /value too long for type character varying\(8000\)/
      )
      await assert.rejects(
        () =>
          client.table('adventure_players').insert({
            ...validProfile,
            adventure_id: adventures[4].id,
            status: 's'.repeat(1_001),
          }),
        /value too long for type character varying\(1000\)/
      )
      await assert.rejects(
        () =>
          client.table('adventure_players').insert({
            ...validProfile,
            adventure_id: adventures[5].id,
            name: '   ',
          }),
        /adventure_players_name_check/
      )
    })
  })

  test('LC-003/S1/R3-S2: durable opening jobs enforce one active generation per Adventure', async ({
    assert,
  }) => {
    await withIsolatedMigrationDatabase(async (client) => {
      const fixture = await createAdventureSourceFixture(client)
      await runMigration(client, CreateAdventureAggregate, migrationName)

      const [adventure] = await client
        .table('adventures')
        .insert(adventureRecord(fixture))
        .returning(['id'])
      const pendingJob = {
        adventure_id: adventure.id,
        generation: 1,
        type: 'opening',
        status: 'pending',
        attempt_count: 0,
        available_at: createdAt,
        lease_owner: null,
        lease_expires_at: null,
        failure_code: null,
        failure_message: null,
        created_at: createdAt,
      }

      const [job] = await client.table('adventure_jobs').insert(pendingJob).returning(['id'])

      assert.match(job.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
      await assert.rejects(
        () => client.table('adventure_jobs').insert(pendingJob),
        /adventure_jobs_one_active_opening_per_adventure/
      )

      await client
        .from('adventure_jobs')
        .where('id', job.id)
        .update({ status: 'succeeded', updated_at: createdAt })
      await client.table('adventure_jobs').insert({
        ...pendingJob,
        generation: 2,
        status: 'processing',
        attempt_count: 1,
        lease_owner: 'worker-1',
        lease_expires_at: new Date('2026-01-01T00:01:00.000Z'),
      })
    })
  })

  test('LC-003/S1/R3-S1 + R3-S3: model-call evidence stays owned by its Adventure job', async ({
    assert,
  }) => {
    await withIsolatedMigrationDatabase(async (client) => {
      const fixture = await createAdventureSourceFixture(client)
      await runMigration(client, CreateAdventureAggregate, migrationName)

      const adventures = await client
        .table('adventures')
        .multiInsert([
          adventureRecord(fixture),
          adventureRecord(fixture, {
            creation_request_id: '22222222-2222-4222-8222-222222222222',
          }),
        ])
        .returning(['id'])
      const jobs = await client
        .table('adventure_jobs')
        .multiInsert(
          adventures.map((adventure) => ({
            adventure_id: adventure.id,
            generation: 1,
            type: 'opening',
            status: 'processing',
            attempt_count: 1,
            available_at: createdAt,
            lease_owner: 'worker-1',
            lease_expires_at: new Date('2026-01-01T00:01:00.000Z'),
            failure_code: null,
            failure_message: null,
            created_at: createdAt,
          }))
        )
        .returning(['id', 'adventure_id'])
      const firstCall = {
        adventure_id: adventures[0].id,
        job_id: jobs.find((job) => job.adventure_id === adventures[0].id)!.id,
        operation: 'opening_generation',
        redacted_request: { messages: [], authorization: '[REDACTED]' },
        raw_response: null,
        provider: 'openai-compatible',
        model: 'test-model',
        settings: { temperature: 0.7 },
        status: 'processing',
        started_at: createdAt,
        completed_at: null,
        duration_ms: null,
        retry_of_model_call_id: null,
        failure_code: null,
        failure_message: null,
        created_at: createdAt,
      }

      const [modelCall] = await client
        .table('model_calls')
        .insert(firstCall)
        .returning(['id', 'raw_response'])

      assert.match(
        modelCall.id,
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      )
      assert.isNull(modelCall.raw_response)

      await assert.rejects(
        () =>
          client.table('model_calls').insert({
            ...firstCall,
            adventure_id: adventures[1].id,
          }),
        /model_calls_job_ownership_foreign/
      )

      const secondJob = jobs.find((job) => job.adventure_id === adventures[1].id)!
      await assert.rejects(
        () =>
          client.table('model_calls').insert({
            ...firstCall,
            adventure_id: adventures[1].id,
            job_id: secondJob.id,
            retry_of_model_call_id: modelCall.id,
          }),
        /model_calls_retry_ownership_foreign/
      )
    })
  })

  test('LC-003/S1/R3-S1 + R3-S4: opening history is absent until immutable owned rows are published', async ({
    assert,
  }) => {
    await withIsolatedMigrationDatabase(async (client) => {
      const fixture = await createAdventureSourceFixture(client)
      await runMigration(client, CreateAdventureAggregate, migrationName)
      const adventures = await client
        .table('adventures')
        .multiInsert([
          adventureRecord(fixture),
          adventureRecord(fixture, {
            creation_request_id: '22222222-2222-4222-8222-222222222222',
          }),
        ])
        .returning(['id', 'head_revision_id'])

      assert.isNull(adventures[0].head_revision_id)
      const revisionCount = await client
        .from('adventure_revisions')
        .where('adventure_id', adventures[0].id)
        .count('*')
      const storyEntryCount = await client
        .from('adventure_story_entries')
        .where('adventure_id', adventures[0].id)
        .count('*')
      assert.equal(Number(revisionCount[0].count), 0)
      assert.equal(Number(storyEntryCount[0].count), 0)

      const [revision] = await client
        .table('adventure_revisions')
        .insert({
          adventure_id: adventures[0].id,
          sequence: 0,
          kind: 'opening',
          parent_revision_id: null,
          created_at: createdAt,
        })
        .returning(['id'])
      const [storyEntry] = await client
        .table('adventure_story_entries')
        .insert({
          adventure_id: adventures[0].id,
          revision_id: revision.id,
          sequence: 0,
          kind: 'narration',
          content: 'The chapel doors open into rain.',
          created_at: createdAt,
        })
        .returning(['id'])

      await client
        .from('adventures')
        .where('id', adventures[0].id)
        .update({ head_revision_id: revision.id })

      await assert.rejects(
        () =>
          client
            .from('adventures')
            .where('id', adventures[1].id)
            .update({ head_revision_id: revision.id }),
        /adventures_head_revision_ownership_foreign/
      )
      await assert.rejects(
        () =>
          client.table('adventure_revisions').insert({
            adventure_id: adventures[1].id,
            sequence: 1,
            kind: 'opening',
            parent_revision_id: revision.id,
            created_at: createdAt,
          }),
        /adventure_revisions_parent_ownership_foreign/
      )
      await assert.rejects(
        () =>
          client.table('adventure_story_entries').insert({
            adventure_id: adventures[1].id,
            revision_id: revision.id,
            sequence: 1,
            kind: 'narration',
            content: 'This entry must not cross Adventure ownership.',
            created_at: createdAt,
          }),
        /adventure_story_entries_revision_ownership_foreign/
      )
      await assert.rejects(
        () =>
          client.from('adventure_revisions').where('id', revision.id).update({ kind: 'changed' }),
        /Adventure revisions are immutable/
      )
      await assert.rejects(
        () =>
          client
            .from('adventure_story_entries')
            .where('id', storyEntry.id)
            .update({ content: 'Changed prose.' }),
        /Adventure story entries are immutable/
      )
    })
  })

  test('LC-003/S1/R4-S3: deleting one Adventure cascades only its private aggregate', async ({
    assert,
  }) => {
    await withIsolatedMigrationDatabase(async (client) => {
      const fixture = await createAdventureSourceFixture(client)
      await runMigration(client, CreateAdventureAggregate, migrationName)
      const adventures = await client
        .table('adventures')
        .multiInsert([
          adventureRecord(fixture),
          adventureRecord(fixture, {
            creation_request_id: '22222222-2222-4222-8222-222222222222',
          }),
        ])
        .returning(['id'])
      const firstAdventureId = adventures[0].id
      const secondAdventureId = adventures[1].id

      await client.table('adventure_players').multiInsert(
        adventures.map((adventure, index) => ({
          adventure_id: adventure.id,
          name: `Player ${index + 1}`,
          physical_description: null,
          backstory: null,
          status: '',
          current_location_key: 'chapel-threshold',
          created_at: createdAt,
        }))
      )
      const [job] = await client
        .table('adventure_jobs')
        .insert({
          adventure_id: firstAdventureId,
          generation: 1,
          type: 'opening',
          status: 'succeeded',
          attempt_count: 1,
          available_at: createdAt,
          lease_owner: null,
          lease_expires_at: null,
          failure_code: null,
          failure_message: null,
          created_at: createdAt,
        })
        .returning(['id'])
      await client.table('model_calls').insert({
        adventure_id: firstAdventureId,
        job_id: job.id,
        operation: 'opening_generation',
        redacted_request: { messages: [] },
        raw_response: 'The chapel doors open into rain.',
        provider: 'test',
        model: 'test-model',
        settings: {},
        status: 'succeeded',
        started_at: createdAt,
        completed_at: createdAt,
        duration_ms: 0,
        retry_of_model_call_id: null,
        failure_code: null,
        failure_message: null,
        created_at: createdAt,
      })
      const [revision] = await client
        .table('adventure_revisions')
        .insert({
          adventure_id: firstAdventureId,
          sequence: 0,
          kind: 'opening',
          parent_revision_id: null,
          created_at: createdAt,
        })
        .returning(['id'])
      await client.table('adventure_story_entries').insert({
        adventure_id: firstAdventureId,
        revision_id: revision.id,
        sequence: 0,
        kind: 'narration',
        content: 'The chapel doors open into rain.',
        created_at: createdAt,
      })
      await client
        .from('adventures')
        .where('id', firstAdventureId)
        .update({ head_revision_id: revision.id })

      await client.from('adventures').where('id', firstAdventureId).delete()

      for (const table of [
        'adventure_players',
        'adventure_jobs',
        'model_calls',
        'adventure_revisions',
        'adventure_story_entries',
      ]) {
        assert.lengthOf(await client.from(table).where('adventure_id', firstAdventureId), 0)
      }
      assert.isNotNull(await client.from('adventures').where('id', secondAdventureId).first())
      assert.isNotNull(await client.from('worlds').where('id', fixture.firstWorldId).first())
      assert.isNotNull(
        await client.from('world_versions').where('id', fixture.firstVersionId).first()
      )

      await assert.rejects(
        () => rollbackMigration(client, CreateAdventureAggregate, migrationName),
        /Cannot remove the Adventure aggregate while it contains data/
      )
      await client.from('adventures').where('id', secondAdventureId).delete()
      await rollbackMigration(client, CreateAdventureAggregate, migrationName)
      assert.isNotNull(await client.from('worlds').where('id', fixture.firstWorldId).first())
      assert.isNotNull(
        await client.from('world_versions').where('id', fixture.firstVersionId).first()
      )
    })
  })

  test('LC-003/S2/R1-S1..R1-S5: durable turns are Adventure-owned, idempotent, and serialized', async ({
    assert,
  }) => {
    await withIsolatedMigrationDatabase(async (client) => {
      const fixture = await createAdventureSourceFixture(client)
      await runMigration(client, CreateAdventureAggregate, migrationName)
      await runMigration(client, AddDurableAdventureTurns, durableTurnsMigrationName)

      const [adventure] = await client
        .table('adventures')
        .insert(adventureRecord(fixture, { status: 'ready' }))
        .returning(['id'])
      const [opening] = await client
        .table('adventure_revisions')
        .insert({
          adventure_id: adventure.id,
          sequence: 0,
          kind: 'opening',
          parent_revision_id: null,
          created_at: createdAt,
        })
        .returning(['id'])
      await client
        .from('adventures')
        .where('id', adventure.id)
        .update({ head_revision_id: opening.id })

      const pendingTurn = {
        adventure_id: adventure.id,
        request_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        trigger: 'act',
        input: 'I ask why the bell rang.',
        status: 'pending',
        source_revision_id: opening.id,
        result_revision_id: null,
        created_at: createdAt,
      }
      const [turn] = await client.table('adventure_turns').insert(pendingTurn).returning(['id'])

      await assert.rejects(
        () => client.table('adventure_turns').insert(pendingTurn),
        /adventure_turns_adventure_id_request_id_unique/
      )
      await assert.rejects(
        () =>
          client.table('adventure_turns').insert({
            ...pendingTurn,
            request_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
          }),
        /adventure_turns_one_active_per_adventure/
      )
      await assert.rejects(
        () =>
          client.table('adventure_turns').insert({
            ...pendingTurn,
            adventure_id: '11111111-1111-4111-8111-111111111111',
          }),
        /violates foreign key constraint/
      )
      await assert.rejects(
        () =>
          client.table('adventure_jobs').insert({
            adventure_id: adventure.id,
            turn_id: null,
            generation: 1,
            type: 'turn',
            status: 'pending',
            attempt_count: 0,
            available_at: createdAt,
            lease_owner: null,
            lease_expires_at: null,
            failure_code: null,
            failure_message: null,
            created_at: createdAt,
          }),
        /adventure_jobs_turn_shape_check/
      )
      await client.table('adventure_jobs').insert({
        adventure_id: adventure.id,
        turn_id: turn.id,
        generation: 1,
        type: 'turn',
        status: 'pending',
        attempt_count: 0,
        available_at: createdAt,
        lease_owner: null,
        lease_expires_at: null,
        failure_code: null,
        failure_message: null,
        created_at: createdAt,
      })

      await assert.rejects(
        () => rollbackMigration(client, AddDurableAdventureTurns, durableTurnsMigrationName),
        /Cannot remove durable Adventure turns while they contain data/
      )
    })
  })
})
