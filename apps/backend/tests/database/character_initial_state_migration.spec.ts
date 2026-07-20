import { test } from '@japa/runner'
import type { QueryClientContract } from '@adonisjs/lucid/types/database'
import CreateUsers from '../../database/migrations/1761885935168_create_users_table.js'
import CreateWorldCatalog from '../../database/migrations/1784053200000_create_world_catalog_tables.js'
import EnforceCharacterLocationWorldIntegrity from '../../database/migrations/1784060400000_enforce_character_location_world_integrity.js'
import AddCharacterInitialState from '../../database/migrations/1784416800000_add_character_initial_state.js'
import {
  rollbackMigration,
  runMigration,
  withIsolatedMigrationDatabase,
} from '../helpers/migration_database.js'

const createdAt = new Date('2026-07-19T00:00:00.000Z')

async function installLegacyCharacter(client: QueryClientContract) {
  await runMigration(client, CreateUsers, '1761885935168_create_users_table')
  await runMigration(client, CreateWorldCatalog, '1784053200000_create_world_catalog_tables')
  await runMigration(
    client,
    EnforceCharacterLocationWorldIntegrity,
    '1784060400000_enforce_character_location_world_integrity'
  )
  const [owner] = await client
    .table('users')
    .insert({
      email: 'initial-state-migration@example.com',
      full_name: null,
      password: 'not-a-real-password-hash',
      created_at: createdAt,
    })
    .returning(['id'])
  const [world] = await client
    .table('worlds')
    .insert({
      author_id: owner.id,
      slug: 'legacy-character-world',
      name: 'Legacy Character World',
      description: 'Keeps existing Character content intact.',
      visibility: 'private',
      created_at: createdAt,
    })
    .returning(['id'])
  const [location] = await client
    .table('locations')
    .insert({
      world_id: world.id,
      key: 'chapel',
      name: 'Chapel',
      description: 'A chapel.',
      sort_order: 0,
      created_at: createdAt,
    })
    .returning(['id'])
  await client.table('characters').insert({
    world_id: world.id,
    location_id: location.id,
    key: 'mira',
    name: 'Mira',
    physical_description: 'Watchful.',
    background: 'A long history.',
    personality: 'Careful.',
    voice: 'Quiet.',
    private_knowledge: 'A secret.',
    sort_order: 0,
    created_at: createdAt,
  })
}

test.group('Character initial state database migration', () => {
  test('LC-002/S3/R2-S1: preserves legacy Character content while backfilling required initial-state columns', async ({
    assert,
  }) => {
    await withIsolatedMigrationDatabase(async (client) => {
      await installLegacyCharacter(client)

      await runMigration(
        client,
        AddCharacterInitialState,
        '1784416800000_add_character_initial_state'
      )

      const character = await client.from('characters').where('key', 'mira').firstOrFail()
      assert.equal(character.name, 'Mira')
      assert.equal(character.private_knowledge, 'A secret.')
      assert.equal(character.initial_mood, '')
      assert.equal(character.initial_status, '')
      assert.equal(character.initial_memory, '')
      await assert.rejects(
        () =>
          client.table('characters').insert({
            ...character,
            id: undefined,
            key: 'missing-initial-state',
            initial_mood: null,
          }),
        /null value in column "initial_mood"/
      )
    })
  })

  test('LC-002/S3/R2-S1: permits empty rollback but refuses to discard authored initial state', async ({
    assert,
  }) => {
    await withIsolatedMigrationDatabase(async (client) => {
      await installLegacyCharacter(client)
      await runMigration(
        client,
        AddCharacterInitialState,
        '1784416800000_add_character_initial_state'
      )
      await rollbackMigration(
        client,
        AddCharacterInitialState,
        '1784416800000_add_character_initial_state'
      )
      await runMigration(
        client,
        AddCharacterInitialState,
        '1784416800000_add_character_initial_state'
      )
      await client.from('characters').where('key', 'mira').update({ initial_mood: 'Uneasy.' })

      await assert.rejects(
        () =>
          rollbackMigration(
            client,
            AddCharacterInitialState,
            '1784416800000_add_character_initial_state'
          ),
        /Cannot remove Character initial state while it contains authored data/
      )
    })
  })
})
