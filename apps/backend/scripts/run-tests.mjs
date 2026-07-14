import { spawn } from 'node:child_process'
import { assertDisposableDatabase, databaseChildEnvironment } from './database-safety.mjs'

const databaseUrl = process.env.TEST_DATABASE_URL

try {
  assertDisposableDatabase({
    acknowledgement: process.env.ALLOW_TEST_DATABASE_WRITES,
    acknowledgementName: 'ALLOW_TEST_DATABASE_WRITES',
    applicationDatabaseUrl: process.env.DATABASE_URL,
    databaseEnvironment: process.env,
    nodeEnvironment: process.env.NODE_ENV,
    targetDatabaseUrl: databaseUrl,
    targetName: 'TEST_DATABASE_URL',
  })
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Test database safety check failed.')
  process.exit(1)
}

const child = spawn(process.execPath, ['ace', 'test', ...process.argv.slice(2)], {
  cwd: new URL('..', import.meta.url),
  env: {
    ...databaseChildEnvironment(process.env),
    DATABASE_URL: databaseUrl,
    NODE_ENV: 'test',
    SESSION_DRIVER: 'database',
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
