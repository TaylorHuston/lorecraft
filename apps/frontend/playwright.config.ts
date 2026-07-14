import { defineConfig, devices } from '@playwright/test'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const databaseUrl = process.env.E2E_DATABASE_URL
const databaseWritesAllowed = process.env.ALLOW_E2E_DATABASE_WRITES === '1'

if (!databaseUrl || !databaseWritesAllowed) {
  throw new Error(
    'E2E_DATABASE_URL and ALLOW_E2E_DATABASE_WRITES=1 are required for a disposable PostgreSQL test database.'
  )
}

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
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: [
    {
      name: 'backend',
      cwd: repositoryRoot,
      command:
        'npm run migrate:ci --workspace @lorecraft/backend && npm run dev --workspace @lorecraft/backend',
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
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
        ...process.env,
        API_SERVER_URL: backendUrl,
      },
      url: frontendUrl,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
})
