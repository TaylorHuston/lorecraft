import { test } from '@japa/runner'
import type { QueryClientContract } from '@adonisjs/lucid/types/database'
import CreateUsers from '../../database/migrations/1761885935168_create_users_table.js'
import CreateWorldCatalog from '../../database/migrations/1784053200000_create_world_catalog_tables.js'
import EnforceCharacterLocationWorldIntegrity from '../../database/migrations/1784060400000_enforce_character_location_world_integrity.js'
import AddWorldSeedIdentity from '../../database/migrations/1784146800000_add_world_seed_identity.js'
import AddFrozenWorldSourceFoundation from '../../database/migrations/1784233200000_add_frozen_world_source_foundation.js'
import {
  rollbackMigration,
  runMigration,
  withIsolatedMigrationDatabase,
} from '../helpers/migration_database.js'

const migrationName = '1784233200000_add_frozen_world_source_foundation'

async function createWorldFixture(client: QueryClientContract) {
  await runMigration(client, CreateUsers, '1761885935168_create_users_table')
  await runMigration(client, CreateWorldCatalog, '1784053200000_create_world_catalog_tables')
  await runMigration(
    client,
    EnforceCharacterLocationWorldIntegrity,
    '1784060400000_enforce_character_location_world_integrity'
  )
  await runMigration(client, AddWorldSeedIdentity, '1784146800000_add_world_seed_identity')

  const [author] = await client
    .table('users')
    .insert({
      email: 'frozen-source-migration@example.com',
      full_name: null,
      password: 'not-a-real-password-hash',
      created_at: new Date('2026-01-01T00:00:00.000Z'),
    })
    .returning('id')
  const worlds = await client
    .table('worlds')
    .multiInsert([
      {
        author_id: author.id,
        slug: 'first-world',
        name: 'First World',
        description: 'The intended Starting Point World.',
        visibility: 'private',
        created_at: new Date('2026-01-01T00:00:00.000Z'),
      },
      {
        author_id: author.id,
        slug: 'second-world',
        name: 'Second World',
        description: 'A different World.',
        visibility: 'private',
        created_at: new Date('2026-01-01T00:00:00.000Z'),
      },
    ])
    .returning(['id', 'slug'])
  const firstWorld = worlds.find((world) => world.slug === 'first-world')!
  const secondWorld = worlds.find((world) => world.slug === 'second-world')!
  const locations = await client
    .table('locations')
    .multiInsert([
      {
        world_id: firstWorld.id,
        key: 'first-location',
        name: 'First Location',
        description: 'A Location in the first World.',
        sort_order: 0,
        created_at: new Date('2026-01-01T00:00:00.000Z'),
      },
      {
        world_id: secondWorld.id,
        key: 'second-location',
        name: 'Second Location',
        description: 'A Location in the second World.',
        sort_order: 0,
        created_at: new Date('2026-01-01T00:00:00.000Z'),
      },
    ])
    .returning(['id', 'world_id'])

  return {
    firstLocationId: locations.find((location) => location.world_id === firstWorld.id)!.id,
    firstWorldId: firstWorld.id,
    secondLocationId: locations.find((location) => location.world_id === secondWorld.id)!.id,
    secondWorldId: secondWorld.id,
  }
}

test.group('Frozen World source database migration', () => {
  test('LC-003/S1/R2-S1 + R2-S3: Starting Points stay in one World with one default', async ({
    assert,
  }) => {
    await withIsolatedMigrationDatabase(async (client) => {
      const fixture = await createWorldFixture(client)

      await runMigration(client, AddFrozenWorldSourceFoundation, migrationName)

      await client.table('world_starting_points').insert({
        world_id: fixture.firstWorldId,
        location_id: fixture.firstLocationId,
        key: 'first-start',
        name: 'First Start',
        opening_premise: 'Begin in the first Location.',
        sort_order: 0,
        is_default: true,
        created_at: new Date('2026-01-01T00:00:00.000Z'),
      })

      await assert.rejects(
        () =>
          client.table('world_starting_points').insert({
            world_id: fixture.firstWorldId,
            location_id: fixture.secondLocationId,
            key: 'cross-world-start',
            name: 'Cross World Start',
            opening_premise: 'This reference must be rejected.',
            sort_order: 1,
            is_default: false,
            created_at: new Date('2026-01-01T00:00:00.000Z'),
          }),
        /world_starting_points_world_id_location_id_foreign/
      )

      await assert.rejects(
        () =>
          client.table('world_starting_points').insert({
            world_id: fixture.firstWorldId,
            location_id: fixture.firstLocationId,
            key: 'second-default',
            name: 'Second Default',
            opening_premise: 'A World cannot have two defaults.',
            sort_order: 1,
            is_default: true,
            created_at: new Date('2026-01-01T00:00:00.000Z'),
          }),
        /world_starting_points_one_default_per_world/
      )
    })
  })

  test('LC-003/S1/R2-S1 + R2-S2: versions use immutable UUID identity and same-World current ownership', async ({
    assert,
  }) => {
    await withIsolatedMigrationDatabase(async (client) => {
      const fixture = await createWorldFixture(client)
      await runMigration(client, AddFrozenWorldSourceFoundation, migrationName)

      const snapshot = {
        schemaVersion: 1,
        world: { slug: 'first-world' },
        locations: [],
        characters: [],
        startingPoints: [],
      }
      const [firstVersion] = await client
        .table('world_versions')
        .insert({
          world_id: fixture.firstWorldId,
          ordinal: 1,
          schema_version: 1,
          content_hash: 'a'.repeat(64),
          snapshot,
          created_at: new Date('2026-01-01T00:00:00.000Z'),
        })
        .returning(['id', 'snapshot'])

      assert.match(
        firstVersion.id,
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      )
      assert.deepEqual(firstVersion.snapshot, snapshot)

      await assert.rejects(
        () =>
          client
            .from('worlds')
            .where('id', fixture.secondWorldId)
            .update({ current_version_id: firstVersion.id }),
        /worlds_current_version_world_id_foreign/
      )

      await client
        .from('worlds')
        .where('id', fixture.firstWorldId)
        .update({ current_version_id: firstVersion.id })
      await assert.rejects(
        () =>
          client
            .from('world_versions')
            .where('id', firstVersion.id)
            .update({ snapshot: { ...snapshot, changed: true } }),
        /WorldVersions are immutable and insert-only/
      )
      await assert.rejects(
        () => client.from('world_versions').where('id', firstVersion.id).delete(),
        /WorldVersions are immutable and insert-only/
      )
      await assert.rejects(
        () => rollbackMigration(client, AddFrozenWorldSourceFoundation, migrationName),
        /Cannot remove the frozen World source foundation while it contains data/
      )
    })
  })
})
