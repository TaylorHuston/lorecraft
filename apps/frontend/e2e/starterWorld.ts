import { execFile } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

const execFileAsync = promisify(execFile)

export const starterWorldAuthorEmail = 'e2e-starter-world-author@example.com'
export const starterWorldAuthorPassword = 'correct horse battery staple'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')

export async function resetStarterWorld() {
  const databaseUrl = process.env.E2E_DATABASE_URL
  if (!databaseUrl) throw new Error('E2E_DATABASE_URL is required to reset the starter World.')

  await execFileAsync('npm', ['run', 'seed:starter-world', '--workspace', '@lorecraft/backend'], {
    cwd: repositoryRoot,
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
      NODE_ENV: 'development',
      STARTER_WORLD_AUTHOR_EMAIL: starterWorldAuthorEmail,
    },
  })
}
