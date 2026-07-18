import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import {
  assertDirectMigrationDatabase,
  databaseChildEnvironment,
} from './database-safety.mjs'

const migrationDatabaseUrl = process.env.MIGRATION_DATABASE_URL

try {
  assertDirectMigrationDatabase({
    acknowledgement: process.env.ALLOW_PRODUCTION_DATABASE_MIGRATION,
    applicationDatabaseUrl: process.env.DATABASE_URL,
    migrationDatabaseUrl,
    nodeEnvironment: process.env.NODE_ENV,
  })
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Production migration safety check failed.')
  process.exit(1)
}

const productionConsole = new URL('../ace.js', import.meta.url)
const command = existsSync(productionConsole) ? 'ace.js' : 'ace'
const child = spawn(process.execPath, [command, 'migration:run', '--force'], {
  cwd: new URL('..', import.meta.url),
  env: {
    ...databaseChildEnvironment(process.env),
    DATABASE_URL: migrationDatabaseUrl,
  },
  stdio: 'inherit',
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 1)
})
