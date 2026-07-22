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
const frontendUrl = 'http://localhost:4313'
const backendUrl = 'http://localhost:4314'
const fakeStoryProviderUrl = 'http://localhost:4315'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
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
      dependencies: ['desktop-chromium'],
      testIgnore: /starter-world\.setup\.ts/,
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: [
    {
      name: 'fake-story-provider',
      cwd: repositoryRoot,
      command: 'node apps/frontend/e2e/fake-story-provider.mjs',
      url: `${fakeStoryProviderUrl}/health`,
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      name: 'backend',
      cwd: repositoryRoot,
      command:
        'npm run migrate:e2e --workspace @lorecraft/backend && DATABASE_URL="$E2E_DATABASE_URL" npm run dev --workspace @lorecraft/backend',
      env: {
        ...databaseChildEnvironment(process.env),
        CORS_ORIGIN: frontendUrl,
        NODE_ENV: 'test',
        LORECRAFT_E2E: '1',
        PORT: '4314',
        SESSION_DRIVER: 'database',
        LLM_BASE_URL: `${fakeStoryProviderUrl}/v1`,
        LLM_API_KEY: 'e2e-provider-key',
        LLM_MODEL: 'e2e-story-model',
        ADVENTURE_WORKER_POLL_INTERVAL_MS: '50',
      },
      url: backendUrl,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      name: 'frontend',
      cwd: repositoryRoot,
      command:
        'npm run dev --workspace @lorecraft/frontend -- --host localhost --port 4313 --strictPort',
      env: {
        API_SERVER_URL: backendUrl,
      },
      url: frontendUrl,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
})
