import { expect, test } from '@playwright/test'
import { expectMobileTouchTarget, expectNoHorizontalOverflow } from './uiAssertions'

test('LC-002/S1/R1-S1 + S2/R1-S1 browses the populated starter World', async ({
  page,
}, testInfo) => {
  const email = 'e2e-starter-world-author@example.com'
  const password = 'correct horse battery staple'

  await page.goto('/sign-in')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page).toHaveURL(/\/worlds$/)
  await expect(page.getByRole('heading', { name: 'Available Worlds' })).toBeVisible()
  await expectNoHorizontalOverflow(page)

  const starterWorldLink = page.getByRole('link', { name: 'Stormbound Chapel' })
  await expect(starterWorldLink).toHaveCount(1)
  await expectMobileTouchTarget(starterWorldLink, testInfo)
  await expect(page.getByLabel('World access')).toContainText('Public')

  await starterWorldLink.click()

  await expect(page).toHaveURL(/\/worlds\/stormbound-chapel$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Stormbound Chapel' })).toBeVisible()
  await expectNoHorizontalOverflow(page)
  await expectMobileTouchTarget(page.getByRole('link', { name: 'Back to Worlds' }), testInfo)
  await expect(page.getByText('public World', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Add Character' })).toBeVisible()

  const locations = page.getByRole('region', { name: 'Locations' })
  await expect(locations.getByRole('heading', { level: 3 })).toHaveText([
    'Chapel',
    'Vestry',
    'Graveyard',
    'Lantern & Bell Tavern',
  ])

  const characters = page.getByRole('region', { name: 'Characters' })
  await expect(characters.getByRole('heading', { level: 3 })).toHaveText([
    'Mira',
    'Brother Alden',
    'Rowan',
    'Lena',
  ])

  const mira = characters.locator('article').filter({
    has: page.getByRole('heading', { level: 3, name: 'Mira' }),
  })
  await expect(mira.getByText('Chapel', { exact: true })).toBeVisible()
  await expect(mira.getByText('Physical description', { exact: true })).toBeVisible()
  await expect(mira.getByText('Background', { exact: true })).toBeVisible()
  await expect(mira.getByText('Personality', { exact: true })).toBeVisible()
  await expect(mira.getByText('Voice', { exact: true })).toBeVisible()
  await expect(mira.getByText('Private knowledge', { exact: true })).toBeVisible()
  await expect(page.getByText(/storm began after the chapel bell/i)).toBeVisible()
})

test('LC-002/S3 author creates, edits, and deletes a complete Character Card', async ({ page }) => {
  const email = 'e2e-starter-world-author@example.com'
  const password = 'correct horse battery staple'
  const createdName = 'E2E Bell Keeper'
  const updatedName = 'E2E Vestry Keeper'

  await page.goto('/sign-in')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.goto('/worlds/stormbound-chapel')

  await page.getByRole('button', { name: 'Add Character' }).click()
  await page.getByLabel('Key').fill('e2e-bell-keeper')
  await page.getByLabel('Name').fill(createdName)
  await page.getByLabel('Canonical Location').selectOption('chapel')
  await page.getByLabel('Physical description').fill('A watchful keeper in a worn blue coat.')
  await page.getByLabel('Background').fill('Keeps the chapel keys through each storm.')
  await page.getByLabel('Personality').fill('Patient and practical.')
  await page.getByLabel('Voice').fill('Quiet and measured.')
  await page.getByLabel('Private knowledge').fill('The spare bell key is beneath the altar.')
  await page.getByLabel('Initial mood').fill('Alert')
  await page.getByLabel('Initial status').fill('Watching the doors.')
  await page.getByLabel('Initial memory').fill('Has not met the player.')
  await page.getByRole('button', { name: 'Create Character' }).click()

  const created = page
    .locator('article')
    .filter({ has: page.getByRole('heading', { name: createdName }) })
  await expect(created).toBeVisible()
  await created.getByRole('button', { name: 'Edit' }).click()
  await page.getByLabel('Name').fill(updatedName)
  await page.getByRole('button', { name: 'Save Character' }).click()

  const updated = page
    .locator('article')
    .filter({ has: page.getByRole('heading', { name: updatedName }) })
  await expect(updated).toBeVisible()
  await updated.getByRole('button', { name: 'Delete' }).click()
  await page
    .getByRole('dialog', { name: `Delete ${updatedName}?` })
    .getByRole('button', { name: 'Delete Character' })
    .click()
  await expect(page.getByRole('heading', { name: updatedName })).toHaveCount(0)
})
