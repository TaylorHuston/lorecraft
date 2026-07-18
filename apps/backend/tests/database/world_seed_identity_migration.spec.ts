import { test } from '@japa/runner'
import type { QueryClientContract } from '@adonisjs/lucid/types/database'
import CreateUsers from '../../database/migrations/1761885935168_create_users_table.js'
import CreateWorldCatalog from '../../database/migrations/1784053200000_create_world_catalog_tables.js'
import AddWorldSeedIdentity from '../../database/migrations/1784146800000_add_world_seed_identity.js'
import {
  rollbackMigration,
  runMigration,
  withIsolatedMigrationDatabase,
} from '../helpers/migration_database.js'

const migrationName = '1784146800000_add_world_seed_identity'

async function createExistingWorld(client: QueryClientContract) {
  await runMigration(client, CreateUsers, '1761885935168_create_users_table')
  await runMigration(client, CreateWorldCatalog, '1784053200000_create_world_catalog_tables')

  const [author] = await client
    .table('users')
    .insert({
      email: 'seed-migration-author@example.com',
      full_name: null,
      password: 'not-a-real-password-hash',
      created_at: new Date('2026-01-01T00:00:00.000Z'),
    })
    .returning('id')

  const [world] = await client
    .table('worlds')
    .insert({
      author_id: author.id,
      slug: 'existing-world',
      name: 'Existing World',
      description: 'A World created before seed provenance existed.',
      visibility: 'private',
      created_at: new Date('2026-01-01T00:00:00.000Z'),
    })
    .returning('id')

  return { authorId: author.id, worldId: world.id }
}

test.group('World seed identity database migration', () => {
  test('preserves existing Worlds, enforces unique seed identity, and reverses cleanly', async ({
    assert,
  }) => {
    await withIsolatedMigrationDatabase(async (client) => {
      const fixture = await createExistingWorld(client)

      await runMigration(client, AddWorldSeedIdentity, migrationName)

      const existingWorld = await client
        .from('worlds')
        .where('id', fixture.worldId)
        .select('slug', 'seed_identity')
        .first()
      assert.deepEqual(existingWorld, { slug: 'existing-world', seed_identity: null })

      await client
        .from('worlds')
        .where('id', fixture.worldId)
        .update({ seed_identity: 'starter-world:stormbound-chapel' })
      await assert.rejects(
        () =>
          client.table('worlds').insert({
            author_id: fixture.authorId,
            seed_identity: 'starter-world:stormbound-chapel',
            slug: 'duplicate-seed-world',
            name: 'Duplicate Seed World',
            description: 'Must be rejected by the provenance constraint.',
            visibility: 'private',
            created_at: new Date('2026-01-01T00:00:00.000Z'),
          }),
        /worlds_seed_identity_unique/
      )

      await assert.rejects(
        () => rollbackMigration(client, AddWorldSeedIdentity, migrationName),
        /Cannot remove World seed identity while seeded Worlds are installed/
      )

      await client.from('worlds').where('id', fixture.worldId).update({ seed_identity: null })
      await rollbackMigration(client, AddWorldSeedIdentity, migrationName)

      await assert.rejects(
        () => client.from('worlds').select('seed_identity').first(),
        /seed_identity/
      )
    })
  })
})
