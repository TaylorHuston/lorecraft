import { test } from '@japa/runner'
import CreateUsers from '../../database/migrations/1761885935168_create_users_table.js'
import NormalizeUsersEmail from '../../database/migrations/1784049600000_normalize_users_email.js'
import { runMigration, withIsolatedMigrationDatabase } from '../helpers/migration_database.js'

test.group('users email normalization database migration', () => {
  test('keeps the historical full_name compatibility column', async ({ assert }) => {
    await withIsolatedMigrationDatabase(async (client) => {
      await runMigration(client, CreateUsers, '1761885935168_create_users_table')

      const result = await client.rawQuery<{
        rows: Array<{ column_name: string; is_nullable: 'YES' | 'NO' }>
      }>(`
        SELECT column_name, is_nullable
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'users'
          AND column_name = 'full_name'
      `)

      assert.deepEqual(result.rows, [{ column_name: 'full_name', is_nullable: 'YES' }])
    })
  })

  test('normalizes historical email values and preserves compatibility data', async ({
    assert,
  }) => {
    await withIsolatedMigrationDatabase(async (client) => {
      await runMigration(client, CreateUsers, '1761885935168_create_users_table')
      await client.table('users').insert({
        email: '  Creator@Example.COM  ',
        full_name: 'Compatibility Name',
        password: 'not-a-real-password-hash',
        created_at: new Date('2026-01-01T00:00:00.000Z'),
      })

      await runMigration(client, NormalizeUsersEmail, '1784049600000_normalize_users_email')

      const user = await client.query().from('users').select('email', 'full_name').first()
      assert.deepEqual(user, {
        email: 'creator@example.com',
        full_name: 'Compatibility Name',
      })

      await assert.rejects(
        () =>
          client.table('users').insert({
            email: 'Not-Normalized@Example.com',
            full_name: null,
            password: 'not-a-real-password-hash',
            created_at: new Date('2026-01-01T00:00:00.000Z'),
          }),
        /users_email_normalized/
      )
    })
  })

  test('fails atomically when historical emails collide after normalization', async ({
    assert,
  }) => {
    await withIsolatedMigrationDatabase(async (client) => {
      await runMigration(client, CreateUsers, '1761885935168_create_users_table')
      await client.table('users').multiInsert([
        {
          email: 'Creator@Example.com',
          full_name: 'First Creator',
          password: 'not-a-real-password-hash',
          created_at: new Date('2026-01-01T00:00:00.000Z'),
        },
        {
          email: ' creator@example.com ',
          full_name: null,
          password: 'not-a-real-password-hash',
          created_at: new Date('2026-01-01T00:00:00.000Z'),
        },
      ])

      await assert.rejects(
        () => runMigration(client, NormalizeUsersEmail, '1784049600000_normalize_users_email'),
        /users_email_unique/
      )

      const users = await client
        .query()
        .from('users')
        .select('email', 'full_name')
        .orderBy('id', 'asc')
      assert.deepEqual(users, [
        { email: 'Creator@Example.com', full_name: 'First Creator' },
        { email: ' creator@example.com ', full_name: null },
      ])

      const constraint = await client.rawQuery<{
        rows: Array<{ constraint_name: string }>
      }>(`
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_schema = current_schema()
          AND table_name = 'users'
          AND constraint_name = 'users_email_normalized'
      `)
      assert.isEmpty(constraint.rows)
    })
  })
})
