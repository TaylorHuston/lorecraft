import { spawn } from 'node:child_process'
import { assertDisposableDatabase, databaseChildEnvironment } from './database-safety.mjs'

const targets = {
  e2e: {
    acknowledgementName: 'ALLOW_E2E_DATABASE_WRITES',
    targetName: 'E2E_DATABASE_URL',
  },
  test: {
    acknowledgementName: 'ALLOW_TEST_DATABASE_WRITES',
    targetName: 'TEST_DATABASE_URL',
  },
}

const target = targets[process.argv[2]]

if (!target) {
  console.error('Migration target must be either test or e2e.')
  process.exit(1)
}

const databaseUrl = process.env[target.targetName]

try {
  assertDisposableDatabase({
    acknowledgement: process.env[target.acknowledgementName],
    acknowledgementName: target.acknowledgementName,
    applicationDatabaseUrl: process.env.DATABASE_URL,
    databaseEnvironment: process.env,
    nodeEnvironment: process.env.NODE_ENV,
    targetDatabaseUrl: databaseUrl,
    targetName: target.targetName,
  })
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Migration database safety check failed.')
  process.exit(1)
}

const child = spawn(process.execPath, ['ace', 'migration:run'], {
  cwd: new URL('..', import.meta.url),
  env: {
    ...databaseChildEnvironment(process.env),
    DATABASE_URL: databaseUrl,
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
