import { spawn } from 'node:child_process'

const databaseUrl = process.env.TEST_DATABASE_URL

if (!databaseUrl || process.env.ALLOW_TEST_DATABASE_WRITES !== '1') {
  console.error(
    'Backend tests require TEST_DATABASE_URL and ALLOW_TEST_DATABASE_WRITES=1 for a disposable PostgreSQL database.'
  )
  process.exit(1)
}

const child = spawn(process.execPath, ['ace', 'test', ...process.argv.slice(2)], {
  cwd: new URL('..', import.meta.url),
  env: {
    ...process.env,
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
