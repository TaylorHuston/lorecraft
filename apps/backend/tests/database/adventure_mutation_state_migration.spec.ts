import { test } from '@japa/runner'
import type { QueryClientContract } from '@adonisjs/lucid/types/database'
import CreateUsers from '../../database/migrations/1761885935168_create_users_table.js'
import CreateWorldCatalog from '../../database/migrations/1784053200000_create_world_catalog_tables.js'
import EnforceCharacterLocationWorldIntegrity from '../../database/migrations/1784060400000_enforce_character_location_world_integrity.js'
import AddWorldSeedIdentity from '../../database/migrations/1784146800000_add_world_seed_identity.js'
import AddFrozenWorldSourceFoundation from '../../database/migrations/1784233200000_add_frozen_world_source_foundation.js'
import CreateAdventureAggregate from '../../database/migrations/1784236800000_create_adventure_aggregate.js'
import AddDurableAdventureTurns from '../../database/migrations/1784409600000_add_durable_adventure_turns.js'
import AddAdventureMutationState from '../../database/migrations/1784413200000_add_adventure_mutation_state.js'
import AddAdventureCharacterDebugOverrides from '../../database/migrations/1784420400000_add_adventure_character_debug_overrides.js'
import {
  rollbackMigration,
  runMigration,
  withIsolatedMigrationDatabase,
} from '../helpers/migration_database.js'

const createdAt = new Date('2026-07-19T00:00:00.000Z')
const mutationMigrationName = '1784413200000_add_adventure_mutation_state'

async function installSource(client: QueryClientContract) {
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
  await runMigration(client, CreateAdventureAggregate, '1784236800000_create_adventure_aggregate')
  await runMigration(client, AddDurableAdventureTurns, '1784409600000_add_durable_adventure_turns')

  const [owner] = await client
    .table('users')
    .insert({
      email: 'mutation-owner@example.com',
      full_name: null,
      password: 'not-a-real-password-hash',
      created_at: createdAt,
    })
    .returning(['id'])
  const [world] = await client
    .table('worlds')
    .insert({
      author_id: owner.id,
      slug: 'mutation-world',
      name: 'Mutation World',
      description: 'A mutation migration fixture.',
      visibility: 'private',
      adventure_guidance: '',
      created_at: createdAt,
    })
    .returning(['id'])
  const [version] = await client
    .table('world_versions')
    .insert({
      world_id: world.id,
      ordinal: 1,
      schema_version: 1,
      content_hash: 'a'.repeat(64),
      snapshot: { schemaVersion: 1, world: {}, locations: [], characters: [], startingPoints: [] },
      created_at: createdAt,
    })
    .returning(['id'])

  return { ownerId: owner.id, worldId: world.id, versionId: version.id }
}

async function createAdventure(
  client: QueryClientContract,
  fixture: Awaited<ReturnType<typeof installSource>>,
  suffix: string
) {
  const [adventure] = await client
    .table('adventures')
    .insert({
      owner_id: fixture.ownerId,
      world_id: fixture.worldId,
      world_version_id: fixture.versionId,
      starting_point_key: 'chapel',
      creation_request_id: `00000000-0000-4000-8000-${suffix}`,
      status: 'ready',
      generation: 1,
      turn_count: 0,
      last_played_at: createdAt,
      created_at: createdAt,
    })
    .returning(['id'])
  const [revision] = await client
    .table('adventure_revisions')
    .insert({
      adventure_id: adventure.id,
      sequence: 0,
      kind: 'opening',
      parent_revision_id: null,
      created_at: createdAt,
    })
    .returning(['id'])
  return { id: adventure.id, revisionId: revision.id }
}

test.group('Adventure mutation state database migration', () => {
  test('LC-003/S2/R4-S2 + R4-S4: Adventure-owned character state and revision outcomes enforce ownership and immutable accepted/rejected shapes', async ({
    assert,
  }) => {
    await withIsolatedMigrationDatabase(async (client) => {
      const fixture = await installSource(client)
      await runMigration(client, AddAdventureMutationState, mutationMigrationName)
      const first = await createAdventure(client, fixture, '000000000001')
      const second = await createAdventure(client, fixture, '000000000002')

      await client.table('adventure_character_states').insert({
        adventure_id: first.id,
        character_key: 'mira',
        current_location_key: 'chapel',
        mood: '',
        status: '',
        memory: '',
        created_at: createdAt,
      })
      await assert.rejects(
        () =>
          client.table('adventure_character_states').insert({
            adventure_id: first.id,
            character_key: 'mira',
            current_location_key: 'crypt',
            mood: '',
            status: '',
            memory: '',
            created_at: createdAt,
          }),
        /adventure_character_states_pkey/
      )
      await assert.rejects(
        () =>
          client.table('adventure_character_states').insert({
            adventure_id: first.id,
            character_key: 'mira-two',
            current_location_key: 'chapel',
            mood: 'm'.repeat(501),
            status: '',
            memory: '',
            created_at: createdAt,
          }),
        /value too long for type character varying\(500\)/
      )

      const acceptedMutation = {
        adventure_id: first.id,
        revision_id: first.revisionId,
        sequence: 0,
        accepted: true,
        actor_type: 'character',
        actor_key: 'mira',
        field: 'mood',
        previous_value: '',
        resulting_value: 'afraid',
        rejection_code: null,
        created_at: createdAt,
      }
      const [mutation] = await client
        .table('adventure_revision_mutations')
        .insert(acceptedMutation)
        .returning(['id'])
      await client.table('adventure_revision_mutations').insert({
        adventure_id: first.id,
        revision_id: first.revisionId,
        sequence: 1,
        accepted: false,
        actor_type: 'character',
        actor_key: 'missing',
        field: 'mood',
        previous_value: null,
        resulting_value: null,
        rejection_code: 'unknown_character',
        created_at: createdAt,
      })

      await assert.rejects(
        () =>
          client.table('adventure_revision_mutations').insert({
            ...acceptedMutation,
            sequence: 2,
            revision_id: second.revisionId,
          }),
        /adventure_revision_mutations_revision_ownership_foreign/
      )
      await assert.rejects(
        () =>
          client.table('adventure_revision_mutations').insert({
            ...acceptedMutation,
            sequence: 2,
            previous_value: null,
          }),
        /adventure_revision_mutations_outcome_shape_check/
      )
      await assert.rejects(
        () =>
          client.table('adventure_revision_mutations').insert({
            ...acceptedMutation,
            sequence: 2,
            accepted: false,
            previous_value: null,
            resulting_value: null,
            rejection_code: null,
          }),
        /adventure_revision_mutations_outcome_shape_check/
      )
      await assert.rejects(
        () =>
          client
            .from('adventure_revision_mutations')
            .where('id', mutation.id)
            .update({ resulting_value: 'calm' }),
        /Adventure revision mutations are immutable/
      )
    })
  })

  test('LC-003/S2/R4-S4: a data-bearing state migration refuses rollback while an empty installation reverses safely', async ({
    assert,
  }) => {
    await withIsolatedMigrationDatabase(async (client) => {
      await installSource(client)
      await runMigration(client, AddAdventureMutationState, mutationMigrationName)
      await rollbackMigration(client, AddAdventureMutationState, mutationMigrationName)
      await runMigration(client, AddAdventureMutationState, mutationMigrationName)
    })

    await withIsolatedMigrationDatabase(async (client) => {
      const fixture = await installSource(client)
      await runMigration(client, AddAdventureMutationState, mutationMigrationName)
      const adventure = await createAdventure(client, fixture, '000000000003')
      await client.table('adventure_character_states').insert({
        adventure_id: adventure.id,
        character_key: 'mira',
        current_location_key: 'chapel',
        mood: '',
        status: '',
        memory: '',
        created_at: createdAt,
      })
      await assert.rejects(
        () => rollbackMigration(client, AddAdventureMutationState, mutationMigrationName),
        /Cannot remove Adventure mutation state while it contains data/
      )
    })
  })

  test('LC-003/S3/R3-S2: NPC debug overrides upgrade existing state and refuse data-bearing rollback', async ({
    assert,
  }) => {
    await withIsolatedMigrationDatabase(async (client) => {
      const fixture = await installSource(client)
      await runMigration(client, AddAdventureMutationState, mutationMigrationName)
      const adventure = await createAdventure(client, fixture, '000000000004')
      await client.table('adventure_character_states').insert({
        adventure_id: adventure.id,
        character_key: 'mira',
        current_location_key: 'chapel',
        mood: 'Uneasy.',
        status: 'Waiting.',
        memory: 'The player arrived.',
        created_at: createdAt,
      })

      await runMigration(
        client,
        AddAdventureCharacterDebugOverrides,
        '1784420400000_add_adventure_character_debug_overrides'
      )
      const upgraded = await client
        .from('adventure_character_states')
        .where('adventure_id', adventure.id)
        .where('character_key', 'mira')
        .firstOrFail()
      assert.equal(upgraded.mood, 'Uneasy.')
      assert.isNull(upgraded.private_knowledge)

      await client
        .from('adventure_character_states')
        .where('adventure_id', adventure.id)
        .where('character_key', 'mira')
        .update({ private_knowledge: 'The bell rope is hidden in the wall.' })
      await assert.rejects(
        () =>
          rollbackMigration(
            client,
            AddAdventureCharacterDebugOverrides,
            '1784420400000_add_adventure_character_debug_overrides'
          ),
        /Cannot remove Adventure NPC debug overrides while they contain data/
      )
    })
  })
})
