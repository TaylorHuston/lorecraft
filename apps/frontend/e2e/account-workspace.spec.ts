import { expect, test } from '@playwright/test'
import { randomUUID } from 'node:crypto'

test('LC-001 completes the account and protected workspace journey', async ({ page }, testInfo) => {
  const email = `e2e-${testInfo.project.name}-${randomUUID()}@example.com`
  const password = 'correct horse battery staple'

  const anonymousProfile = await page.request.get('/api/v1/account/profile')
  expect(anonymousProfile.status()).toBe(401)
  expect(await anonymousProfile.json()).not.toHaveProperty('data')

  await page.goto('/sign-up')
  await page.getByLabel('Email').fill('not-an-email')
  await page.getByLabel('Password', { exact: true }).fill('short')
  await page.getByLabel('Confirm password').fill('different')
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page.getByText('Enter a valid email address.')).toBeVisible()
  await expect(page.getByText('Use at least 12 characters.')).toBeVisible()
  await expect(page.getByText('Passwords must match.')).toBeVisible()

  await page.getByLabel('Email').fill(` ${email.toUpperCase()} `)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByLabel('Confirm password').fill(password)
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page).toHaveURL(/\/worlds$/)
  await expect(page.getByRole('heading', { name: 'Worlds', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Stormbound Chapel' })).toBeVisible()
  await expect(page.getByRole('button', { name: /create.*world/i })).toHaveCount(0)

  const browserSession = (await page.context().cookies()).find(
    (cookie) => cookie.name === 'adonis-session'
  )
  expect(browserSession).toMatchObject({ httpOnly: true, sameSite: 'Lax' })
  expect(await page.evaluate(() => document.cookie)).not.toContain('adonis-session')
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([])
  expect(await page.evaluate(() => Object.keys(sessionStorage))).toEqual([])

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Worlds', exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByRole('heading', { name: 'Sign in to Lorecraft' })).toBeVisible()

  await page.context().addCookies([
    {
      name: 'adonis-session',
      value: browserSession!.value,
      domain: 'localhost',
      path: '/',
    },
  ])
  const reusedSession = await page.request.get('/api/v1/account/profile')
  expect(reusedSession.status()).toBe(401)
  expect(await reusedSession.json()).not.toHaveProperty('data')
  await page.context().clearCookies()
  await page.goto('/sign-in')

  await page.getByLabel('Email').fill('unknown@example.com')
  await page.getByLabel('Password', { exact: true }).fill('incorrect password')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('alert')).toHaveText('Email or password is incorrect. Try again.')

  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill('this password is incorrect')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('alert')).toHaveText('Email or password is incorrect. Try again.')

  await page.getByRole('link', { name: 'Create an account' }).click()
  await expect(page).toHaveURL(/\/sign-up$/)
  await expect(page.getByRole('heading', { name: 'Create your Lorecraft account' })).toBeVisible()
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByLabel('Confirm password').fill(password)
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page.getByText('An account with this email already exists.')).toBeVisible()

  await page.getByRole('link', { name: 'Sign in instead' }).click()
  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByRole('heading', { name: 'Sign in to Lorecraft' })).toBeVisible()
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('heading', { name: 'Worlds', exact: true })).toBeVisible()

  await page.goto('/sign-up')
  await expect(page).toHaveURL(/\/worlds$/)

  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(/\/sign-in$/)
  await page.goto('/worlds')
  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByRole('heading', { name: 'Worlds', exact: true })).toHaveCount(0)
})
