import { expect, test, type BrowserContext, type Page } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { resetStarterWorld } from './starterWorld'
import { expectMobileTouchTarget, expectNoHorizontalOverflow } from './uiAssertions'

const password = 'correct horse battery staple'
const opening =
  'Rain drums against the chapel doors as you step beneath the cracked lintel. Mira watches from the aisle while Brother Alden steadies the lantern, and somewhere above them the bell sounds once without a hand on its rope.'

async function startAdventure(page: Page, playerName: string) {
  await page.goto('/worlds/stormbound-chapel/adventures/new')
  await page.getByLabel('Player name (required)').fill(playerName)
  await page.getByRole('button', { name: 'Start Adventure' }).click()
  await expect(page).toHaveURL(/\/adventures\/[0-9a-f-]+$/)
  const adventureUrl = page.url()
  await expect(page.getByText(opening)).toBeVisible({ timeout: 15_000 })
  return adventureUrl
}

async function openScene(page: Page, mobile: boolean) {
  if (mobile) await page.getByRole('tab', { name: 'Scene' }).click()
  return mobile ? page.getByRole('tabpanel', { name: 'Scene' }) : page.getByRole('region', { name: 'Scene' })
}

async function signInStarterAuthor(context: BrowserContext) {
  const page = await context.newPage()
  await page.goto('/sign-in')
  await page.getByLabel('Email').fill('e2e-starter-world-author@example.com')
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/worlds$/)
  return page
}

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
  await expect(page).toHaveURL(/\/worlds$/)
  await page.goto('/worlds/stormbound-chapel')

  try {
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

    const characters = page.getByRole('region', { name: 'Characters' })
    const created = characters.locator('article').filter({
      has: page.getByRole('heading', { level: 3, name: createdName, exact: true }),
    })
    await expect(created).toBeVisible()
    await created.getByRole('button', { name: 'Edit' }).click()
    await page.getByLabel('Name').fill(updatedName)
    await page.getByRole('button', { name: 'Save Character' }).click()

    const updated = characters.locator('article').filter({
      has: page.getByRole('heading', { level: 3, name: updatedName, exact: true }),
    })
    await expect(updated).toBeVisible()
    await updated.getByRole('button', { name: 'Delete' }).click()
    await page
      .getByRole('dialog', { name: `Delete ${updatedName}?` })
      .getByRole('button', { name: 'Delete Character' })
      .click()
    await expect(updated).toHaveCount(0)
  } finally {
    await resetStarterWorld()
  }
})

test('LC-002/S3/R5-S1 + LC-003/S1/R2-S2 freezes existing NPC cards while new Adventures use published canon', async ({
  browser,
  page,
}, testInfo) => {
  const identity = randomUUID().slice(0, 8)
  const originalPlayer = `E2E Frozen Original ${identity}`
  const newPlayer = `E2E Frozen New ${identity}`
  const renamedMira = `E2E Published Mira ${identity}`
  const email = `frozen-${testInfo.project.name}-${identity}@example.com`
  let authorContext: BrowserContext | null = null

  await page.goto('/sign-up')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByLabel('Confirm password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page).toHaveURL(/\/worlds$/)

  try {
    const oldAdventureUrl = await startAdventure(page, originalPlayer)

    authorContext = await browser.newContext()
    const authorPage = await signInStarterAuthor(authorContext)
    await authorPage.goto('/worlds/stormbound-chapel')
    const characters = authorPage.getByRole('region', { name: 'Characters' })
    const mira = characters.locator('article').filter({
      has: authorPage.getByRole('heading', { level: 3, name: 'Mira', exact: true }),
    })
    await mira.getByRole('button', { name: 'Edit' }).click()
    await authorPage.getByLabel('Name').fill(renamedMira)
    await authorPage.getByRole('button', { name: 'Save Character' }).click()
    await expect(
      characters.getByRole('heading', { level: 3, name: renamedMira, exact: true })
    ).toBeVisible()

    await page.goto(oldAdventureUrl)
    const oldScene = await openScene(page, testInfo.project.name.includes('mobile'))
    await expect(oldScene.getByRole('button', { name: 'Mira', exact: true })).toBeVisible()
    await expect(oldScene.getByRole('button', { name: renamedMira, exact: true })).toHaveCount(0)

    const newAdventureUrl = await startAdventure(page, newPlayer)
    await expect(newAdventureUrl).not.toBe(oldAdventureUrl)
    const newScene = await openScene(page, testInfo.project.name.includes('mobile'))
    await expect(newScene.getByRole('button', { name: renamedMira, exact: true })).toBeVisible()
    await expect(newScene.getByRole('button', { name: 'Mira', exact: true })).toHaveCount(0)
  } finally {
    await authorContext?.close()
    await resetStarterWorld()
  }
})
