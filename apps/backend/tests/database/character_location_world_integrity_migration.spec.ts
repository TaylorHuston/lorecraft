import { test } from '@japa/runner'
import type { QueryClientContract } from '@adonisjs/lucid/types/database'
import CreateUsers from '../../database/migrations/1761885935168_create_users_table.js'
import CreateWorldCatalog from '../../database/migrations/1784053200000_create_world_catalog_tables.js'
import EnforceCharacterLocationWorldIntegrity from '../../database/migrations/1784060400000_enforce_character_location_world_integrity.js'
import {
  rollbackMigration,
  runMigration,
  withIsolatedMigrationDatabase,
} from '../helpers/migration_database.js'

const migrationName = '1784060400000_enforce_character_location_world_integrity'

async function createWorldFixture(client: QueryClientContract) {
  await runMigration(client, CreateUsers, '1761885935168_create_users_table')
  await runMigration(client, CreateWorldCatalog, '1784053200000_create_world_catalog_tables')

  const [author] = await client
    .table('users')
    .insert({
      email: 'migration-author@example.com',
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
        slug: 'migration-first-world',
        name: 'Migration First World',
        description: 'The Character World.',
        visibility: 'private',
        created_at: new Date('2026-01-01T00:00:00.000Z'),
      },
      {
        author_id: author.id,
        slug: 'migration-second-world',
        name: 'Migration Second World',
        description: 'The Location World.',
        visibility: 'private',
        created_at: new Date('2026-01-01T00:00:00.000Z'),
      },
    ])
    .returning(['id', 'slug'])
  const firstWorld = worlds.find((world) => world.slug === 'migration-first-world')!
  const secondWorld = worlds.find((world) => world.slug === 'migration-second-world')!
  const [firstLocation] = await client
    .table('locations')
    .insert({
      world_id: firstWorld.id,
      key: 'first-location',
      name: 'First Location',
      description: 'A Location in the first World.',
      sort_order: 0,
      created_at: new Date('2026-01-01T00:00:00.000Z'),
    })
    .returning('id')
  const [secondLocation] = await client
    .table('locations')
    .insert({
      world_id: secondWorld.id,
      key: 'second-location',
      name: 'Second Location',
      description: 'A Location in the second World.',
      sort_order: 0,
      created_at: new Date('2026-01-01T00:00:00.000Z'),
    })
    .returning('id')

  return {
    firstLocationId: firstLocation.id,
    firstWorldId: firstWorld.id,
    secondLocationId: secondLocation.id,
  }
}

function characterFixture(worldId: number, locationId: number, key: string) {
  return {
    world_id: worldId,
    location_id: locationId,
    key,
    name: 'Migration Character',
    physical_description: 'A Character used to verify the migration.',
    background: 'Created in an isolated migration schema.',
    personality: 'Careful.',
    voice: 'Direct.',
    private_knowledge: 'None.',
    sort_order: 0,
    created_at: new Date('2026-01-01T00:00:00.000Z'),
  }
}

test.group('Character Location World integrity database migration', () => {
  test('upgrades a clean World graph, enforces same-World Locations, and reverses cleanly', async ({
    assert,
  }) => {
    await withIsolatedMigrationDatabase(async (client) => {
      const fixture = await createWorldFixture(client)
      await client
        .table('characters')
        .insert(characterFixture(fixture.firstWorldId, fixture.firstLocationId, 'valid-character'))

      await runMigration(client, EnforceCharacterLocationWorldIntegrity, migrationName)

      await assert.rejects(
        () =>
          client
            .table('characters')
            .insert(
              characterFixture(
                fixture.firstWorldId,
                fixture.secondLocationId,
                'cross-world-character'
              )
            ),
        /characters_world_id_location_id_foreign/
      )

      await rollbackMigration(client, EnforceCharacterLocationWorldIntegrity, migrationName)

      await client
        .table('characters')
        .insert(
          characterFixture(fixture.firstWorldId, fixture.secondLocationId, 'allowed-after-rollback')
        )
    })
  })

  test('fails without changing data when an existing Character crosses World boundaries', async ({
    assert,
  }) => {
    await withIsolatedMigrationDatabase(async (client) => {
      const fixture = await createWorldFixture(client)
      await client
        .table('characters')
        .insert(
          characterFixture(fixture.firstWorldId, fixture.secondLocationId, 'existing-mismatch')
        )

      await assert.rejects(
        () => runMigration(client, EnforceCharacterLocationWorldIntegrity, migrationName),
        /Cannot enforce Character Location World integrity/
      )

      const characters = await client.from('characters').select('key')
      assert.deepEqual(characters, [{ key: 'existing-mismatch' }])
    })
  })
})
