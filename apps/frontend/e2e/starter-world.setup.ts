import { expect, test } from '@playwright/test'
import { execFile } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

const execFileAsync = promisify(execFile)
const authorEmail = 'e2e-starter-world-author@example.com'
const password = 'correct horse battery staple'
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')

test('LC-002/S2/R1-S3 installs the starter World through the documented command', async ({
  page,
}) => {
  await page.goto('/sign-in')
  await page.getByLabel('Email').fill(authorEmail)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()

  const existingAccount = await Promise.race([
    page.waitForURL(/\/worlds$/).then(() => true),
    page
      .getByText('Email or password is incorrect. Try again.')
      .waitFor()
      .then(() => false),
  ])

  if (!existingAccount) {
    await page.goto('/sign-up')
    await page.getByLabel('Email').fill(authorEmail)
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByLabel('Confirm password', { exact: true }).fill(password)
    await page.getByRole('button', { name: 'Create account' }).click()
  }

  await expect(page).toHaveURL(/\/worlds$/)

  const databaseUrl = process.env.E2E_DATABASE_URL
  expect(databaseUrl, 'E2E_DATABASE_URL is required by Playwright configuration').toBeTruthy()

  for (let run = 0; run < 2; run += 1) {
    await execFileAsync('npm', ['run', 'seed:starter-world', '--workspace', '@lorecraft/backend'], {
      cwd: repositoryRoot,
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
        NODE_ENV: 'development',
        STARTER_WORLD_AUTHOR_EMAIL: authorEmail,
      },
    })
  }
})
