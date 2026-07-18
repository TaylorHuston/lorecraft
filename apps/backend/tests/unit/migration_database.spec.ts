import { test } from '@japa/runner'
import type { QueryClientContract } from '@adonisjs/lucid/types/database'
import { createMigrationDatabaseHarness } from '../helpers/migration_database.js'

test.group('migration database harness', () => {
  test('rejects an unsafe environment before any database operation', async ({ assert }) => {
    const operations: string[] = []
    const harness = createMigrationDatabaseHarness({
      database: {
        async rawQuery() {
          operations.push('raw query')
        },
        manager: {
          add() {
            operations.push('add connection')
          },
          has() {
            return false
          },
          async close() {
            operations.push('close connection')
          },
        },
        connection() {
          operations.push('get connection')
          return {} as QueryClientContract
        },
      },
      environment: {
        ALLOW_TEST_DATABASE_WRITES: undefined,
        DATABASE_URL: 'postgresql://test:test@localhost/lorecraft_test',
        NODE_ENV: 'test',
      },
      schemaName: () => 'lorecraft_migration_test_guard_order',
    })

    await assert.rejects(
      () => harness(async () => undefined),
      /explicitly acknowledged test database/
    )
    assert.deepEqual(operations, [])
  })

  test('rejects a non-test environment before any database operation', async ({ assert }) => {
    const operations: string[] = []
    const harness = createMigrationDatabaseHarness({
      database: {
        async rawQuery() {
          operations.push('raw query')
        },
        manager: {
          add() {
            operations.push('add connection')
          },
          has() {
            return false
          },
          async close() {
            operations.push('close connection')
          },
        },
        connection() {
          operations.push('get connection')
          return {} as QueryClientContract
        },
      },
      environment: {
        ALLOW_TEST_DATABASE_WRITES: '1',
        DATABASE_URL: 'postgresql://test:test@localhost/lorecraft_test',
        NODE_ENV: 'development',
      },
      schemaName: () => 'lorecraft_migration_test_environment_guard_order',
    })

    await assert.rejects(
      () => harness(async () => undefined),
      /explicitly acknowledged test database/
    )
    assert.deepEqual(operations, [])
  })

  test('preserves the create error without attempting cleanup when schema creation fails', async ({
    assert,
  }) => {
    const operations: string[] = []
    const harness = createMigrationDatabaseHarness({
      database: {
        async rawQuery(query) {
          operations.push(query.startsWith('CREATE') ? 'create schema' : 'drop schema')

          if (query.startsWith('CREATE')) {
            throw new Error('create failed')
          }

          throw new Error('drop failed')
        },
        manager: {
          add() {
            throw new Error('connection must not be registered')
          },
          has() {
            return false
          },
          async close() {
            throw new Error('connection must not be closed')
          },
        },
        connection() {
          throw new Error('callback must not run')
        },
      },
      environment: {
        ALLOW_TEST_DATABASE_WRITES: '1',
        DATABASE_URL: 'postgresql://test:test@localhost/lorecraft_test',
        NODE_ENV: 'test',
      },
      schemaName: () => 'lorecraft_migration_test_create_failure',
    })

    await assert.rejects(() => harness(async () => undefined), /create failed/)
    assert.deepEqual(operations, ['create schema'])
  })

  test('cleans up a schema and partial connection when registration fails', async ({ assert }) => {
    const operations: string[] = []
    let connectionRegistered = false
    const harness = createMigrationDatabaseHarness({
      database: {
        async rawQuery(query) {
          operations.push(query.startsWith('CREATE') ? 'create schema' : 'drop schema')
        },
        manager: {
          add() {
            operations.push('add connection')
            connectionRegistered = true
            throw new Error('registration failed')
          },
          has() {
            return connectionRegistered
          },
          async close() {
            operations.push('close connection')
            connectionRegistered = false
          },
        },
        connection() {
          throw new Error('callback must not run')
        },
      },
      environment: {
        ALLOW_TEST_DATABASE_WRITES: '1',
        DATABASE_URL: 'postgresql://test:test@localhost/lorecraft_test',
        NODE_ENV: 'test',
      },
      schemaName: () => 'lorecraft_migration_test_registration_failure',
    })

    await assert.rejects(() => harness(async () => undefined), /registration failed/)
    assert.deepEqual(operations, [
      'create schema',
      'add connection',
      'close connection',
      'drop schema',
    ])
  })

  test('cleans up the connection and schema when the migration callback fails', async ({
    assert,
  }) => {
    const operations: string[] = []
    let connectionRegistered = false
    const client = {} as QueryClientContract
    const harness = createMigrationDatabaseHarness({
      database: {
        async rawQuery(query) {
          operations.push(query.startsWith('CREATE') ? 'create schema' : 'drop schema')
        },
        manager: {
          add() {
            operations.push('add connection')
            connectionRegistered = true
          },
          has() {
            return connectionRegistered
          },
          async close() {
            operations.push('close connection')
            connectionRegistered = false
          },
        },
        connection() {
          operations.push('get connection')
          return client
        },
      },
      environment: {
        ALLOW_TEST_DATABASE_WRITES: '1',
        DATABASE_URL: 'postgresql://test:test@localhost/lorecraft_test',
        NODE_ENV: 'test',
      },
      schemaName: () => 'lorecraft_migration_test_callback_failure',
    })

    await assert.rejects(
      () =>
        harness(async (migrationClient) => {
          assert.strictEqual(migrationClient, client)
          operations.push('run callback')
          throw new Error('callback failed')
        }),
      /callback failed/
    )
    assert.deepEqual(operations, [
      'create schema',
      'add connection',
      'get connection',
      'run callback',
      'close connection',
      'drop schema',
    ])
  })
})
