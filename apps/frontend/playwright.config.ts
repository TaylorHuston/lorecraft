import { defineConfig, devices } from '@playwright/test'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  assertDisposableDatabase,
  databaseChildEnvironment,
} from '../backend/scripts/database-safety.mjs'

const databaseUrl = process.env.E2E_DATABASE_URL

assertDisposableDatabase({
  acknowledgement: process.env.ALLOW_E2E_DATABASE_WRITES,
  acknowledgementName: 'ALLOW_E2E_DATABASE_WRITES',
  applicationDatabaseUrl: process.env.DATABASE_URL,
  databaseEnvironment: process.env,
  nodeEnvironment: process.env.NODE_ENV,
  targetDatabaseUrl: databaseUrl,
  targetName: 'E2E_DATABASE_URL',
})

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const frontendUrl = 'http://localhost:4173'
const backendUrl = 'http://localhost:3335'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: frontendUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'starter-world-setup',
      testMatch: /starter-world\.setup\.ts/,
    },
    {
      name: 'desktop-chromium',
      dependencies: ['starter-world-setup'],
      testIgnore: /starter-world\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chromium',
      dependencies: ['starter-world-setup'],
      testIgnore: /starter-world\.setup\.ts/,
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: [
    {
      name: 'backend',
      cwd: repositoryRoot,
      command:
        'npm run migrate:e2e --workspace @lorecraft/backend && DATABASE_URL="$E2E_DATABASE_URL" npm run dev --workspace @lorecraft/backend',
      env: {
        ...databaseChildEnvironment(process.env),
        CORS_ORIGIN: frontendUrl,
        NODE_ENV: 'development',
        PORT: '3335',
        SESSION_DRIVER: 'database',
      },
      url: backendUrl,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      name: 'frontend',
      cwd: repositoryRoot,
      command:
        'npm run dev --workspace @lorecraft/frontend -- --host localhost --port 4173 --strictPort',
      env: {
        API_SERVER_URL: backendUrl,
      },
      url: frontendUrl,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
})
