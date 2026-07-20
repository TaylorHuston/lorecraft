import { expect, test } from '@playwright/test'
import {
  resetStarterWorld,
  starterWorldAuthorEmail,
  starterWorldAuthorPassword,
} from './starterWorld'

test('LC-002/S2/R1-S3 installs the starter World through the documented command', async ({
  page,
}) => {
  await page.goto('/sign-in')
  await page.getByLabel('Email').fill(starterWorldAuthorEmail)
  await page.getByLabel('Password', { exact: true }).fill(starterWorldAuthorPassword)
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
    await page.getByLabel('Email').fill(starterWorldAuthorEmail)
    await page.getByLabel('Password', { exact: true }).fill(starterWorldAuthorPassword)
    await page
      .getByLabel('Confirm password', { exact: true })
      .fill(starterWorldAuthorPassword)
    await page.getByRole('button', { name: 'Create account' }).click()
  }

  await expect(page).toHaveURL(/\/worlds$/)

  for (let run = 0; run < 2; run += 1) {
    await resetStarterWorld()
  }
})
