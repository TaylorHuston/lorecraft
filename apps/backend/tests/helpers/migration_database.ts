import { randomUUID } from 'node:crypto'
import type { BaseSchema } from '@adonisjs/lucid/schema'
import db from '@adonisjs/lucid/services/db'
import type { QueryClientContract } from '@adonisjs/lucid/types/database'

type MigrationConstructor = new (
  client: QueryClientContract,
  file: string,
  dryRun?: boolean
) => BaseSchema

type MigrationDatabaseAdapter = {
  rawQuery(query: string): Promise<unknown>
  manager: {
    add(connectionName: string, config: { client: 'pg'; connection: string }): void
    has(connectionName: string): boolean
    close(connectionName: string, release: boolean): Promise<void>
  }
  connection(connectionName: string): QueryClientContract
}

type MigrationTestEnvironment = {
  ALLOW_TEST_DATABASE_WRITES: string | undefined
  DATABASE_URL: string | undefined
  NODE_ENV: string | undefined
}

type MigrationDatabaseHarnessOptions = {
  database: MigrationDatabaseAdapter
  environment: MigrationTestEnvironment
  schemaName: () => string
}

function migrationConnectionUrl(schemaName: string, environment: MigrationTestEnvironment) {
  const databaseUrl = environment.DATABASE_URL

  if (
    environment.NODE_ENV !== 'test' ||
    environment.ALLOW_TEST_DATABASE_WRITES !== '1' ||
    !databaseUrl
  ) {
    throw new Error('Migration tests require an explicitly acknowledged test database.')
  }

  const url = new URL(databaseUrl)

  url.searchParams.delete('options')
  url.searchParams.append('options', `-csearch_path=${schemaName}`)

  return url.toString()
}

export function createMigrationDatabaseHarness({
  database,
  environment,
  schemaName,
}: MigrationDatabaseHarnessOptions) {
  return async (callback: (client: QueryClientContract) => Promise<void>) => {
    const temporarySchemaName = schemaName()
    const connectionName = temporarySchemaName
    const connectionUrl = migrationConnectionUrl(temporarySchemaName, environment)
    let schemaCreated = false

    try {
      await database.rawQuery(`CREATE SCHEMA "${temporarySchemaName}"`)
      schemaCreated = true
      database.manager.add(connectionName, {
        client: 'pg',
        connection: connectionUrl,
      })
      await callback(database.connection(connectionName))
    } finally {
      try {
        if (database.manager.has(connectionName)) {
          await database.manager.close(connectionName, true)
        }
      } finally {
        if (schemaCreated) {
          await database.rawQuery(`DROP SCHEMA IF EXISTS "${temporarySchemaName}" CASCADE`)
        }
      }
    }
  }
}

export async function runMigration(
  client: QueryClientContract,
  Migration: MigrationConstructor,
  fileName: string
) {
  const transaction = await client.transaction()

  try {
    await new Migration(transaction, fileName).execUp()
    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

export async function rollbackMigration(
  client: QueryClientContract,
  Migration: MigrationConstructor,
  fileName: string
) {
  const transaction = await client.transaction()

  try {
    await new Migration(transaction, fileName).execDown()
    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

export const withIsolatedMigrationDatabase = createMigrationDatabaseHarness({
  database: db as MigrationDatabaseAdapter,
  environment: {
    ALLOW_TEST_DATABASE_WRITES: process.env.ALLOW_TEST_DATABASE_WRITES,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
  schemaName: () => `lorecraft_migration_test_${randomUUID().replaceAll('-', '')}`,
})
