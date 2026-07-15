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
  await expect(page.getByLabel('World access')).toContainText('Read only')

  await starterWorldLink.click()

  await expect(page).toHaveURL(/\/worlds\/stormbound-chapel$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Stormbound Chapel' })).toBeVisible()
  await expectNoHorizontalOverflow(page)
  await expectMobileTouchTarget(page.getByRole('link', { name: 'Back to Worlds' }), testInfo)
  await expect(page.getByText('public World', { exact: true })).toBeVisible()
  await expect(page.getByText('Read only', { exact: true })).toBeVisible()

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
  await expect(
    mira.getByText(
      'Mira knows the storm began after the chapel bell rang at midnight, but she is afraid to say that plainly.',
      { exact: true }
    )
  ).toBeVisible()
})
