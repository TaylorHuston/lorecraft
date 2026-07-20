import { expect, test, type Page } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { expectMobileTouchTarget, expectNoHorizontalOverflow } from './uiAssertions'

const password = 'correct horse battery staple'
const opening =
  'Rain drums against the chapel doors as you step beneath the cracked lintel. Mira watches from the aisle while Brother Alden steadies the lantern, and somewhere above them the bell sounds once without a hand on its rope.'
const actTurn =
  'The bell answers your question with a second, hollow toll. Mira leads you through the side door into the vestry.'
const guideTurn =
  'Brother Alden opens the ledger at last, and a faded name catches the lantern light before the storm swallows the sound outside.'
const passTurn =
  'The silence lengthens. Rain keeps time against the shutters until Mira finally turns toward the altar.'

async function deleteAdventureIfPresent(page: Page, playerName: string) {
  await page.goto('/worlds')
  const deleteButton = page.getByRole('button', {
    name: `Delete Adventure for ${playerName}`,
  })
  if (!(await deleteButton.isVisible().catch(() => false))) return

  await deleteButton.click()
  const dialog = page.getByRole('dialog', { name: `Delete ${playerName}'s Adventure?` })
  await dialog.getByRole('button', { name: 'Delete Adventure' }).click()
  await expect(deleteButton).toHaveCount(0)
}

async function expectVestryContext(page: Page, testInfo: { project: { name: string } }) {
  if (testInfo.project.name.includes('mobile')) {
    await page.getByRole('tab', { name: 'Player' }).click()
    await expect(page.getByRole('tabpanel', { name: 'Player' })).toContainText('Vestry')
    await page.getByRole('tab', { name: 'Scene' }).click()
    await expect(page.getByRole('tabpanel', { name: 'Scene' })).toContainText('Vestry')
    await page.getByRole('tab', { name: 'Story' }).click()
    return
  }

  await expect(page.getByRole('region', { name: 'Player' })).toContainText('Vestry')
  await expect(page.getByRole('region', { name: 'Scene' })).toContainText('Vestry')
}

test('LC-003 creates, opens, resumes, resets, and deletes an isolated Adventure', async ({
  browser,
  page,
}, testInfo) => {
  const identity = randomUUID().slice(0, 8)
  const email = `adventure-${testInfo.project.name}-${identity}@example.com`
  const playerName = `Elara ${identity}`

  await page.goto('/sign-up')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByLabel('Confirm password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Create account' }).click()

  try {
    await expect(page).toHaveURL(/\/worlds$/)
    await expect(page.getByText('No Adventures started in this World.')).toBeVisible()

    const newAdventure = page.getByRole('link', { name: 'New Adventure' })
    await expectMobileTouchTarget(newAdventure, testInfo)
    await newAdventure.click()
    await expect(page).toHaveURL(/\/worlds\/stormbound-chapel\/adventures\/new$/)
    await expect(page.getByRole('heading', { name: 'Start an Adventure' })).toBeVisible()
    await expectNoHorizontalOverflow(page)

    await page.getByLabel('Player name (required)').fill(playerName)
    await page
      .getByLabel('Physical description (optional)')
      .fill('A scholar in a salt-stained cloak.')
    await page.getByLabel('Backstory (optional)').fill('An archivist following a forbidden map.')
    await page.getByRole('button', { name: 'Start Adventure' }).click()

    await expect(page).toHaveURL(/\/adventures\/[0-9a-f-]+$/)
    const adventureUrl = page.url()
    await expect(page.getByText('Preparing your opening')).toBeVisible()
    if (testInfo.project.name.includes('mobile')) {
      await page.getByRole('tab', { name: 'Player' }).click()
      await expect(page.getByRole('tabpanel', { name: 'Player' })).toContainText(playerName)
      await expect(page.getByRole('tabpanel', { name: 'Player' })).toContainText('Chapel')
      await page.getByRole('tab', { name: 'Story' }).click()
    } else {
      await expect(page.getByText(playerName)).toBeVisible()
      await expect(page.getByText('Chapel', { exact: true }).first()).toBeVisible()
    }
    await page.reload()
    await expect(page).toHaveURL(adventureUrl)
    await expect(page.getByText(opening)).toBeVisible({ timeout: 15_000 })
    await expectNoHorizontalOverflow(page)

    const anonymousContext = await browser.newContext()
    const anonymousPage = await anonymousContext.newPage()
    await anonymousPage.goto(adventureUrl)
    await expect(anonymousPage).toHaveURL(/\/sign-in$/)
    await expect(anonymousPage.getByRole('heading', { name: 'Sign in to Lorecraft' })).toBeVisible()
    await anonymousContext.close()

    const outsiderContext = await browser.newContext()
    const outsiderPage = await outsiderContext.newPage()
    await outsiderPage.goto('/sign-up')
    await outsiderPage
      .getByLabel('Email')
      .fill(`outsider-${testInfo.project.name}-${identity}@example.com`)
    await outsiderPage.getByLabel('Password', { exact: true }).fill(password)
    await outsiderPage.getByLabel('Confirm password', { exact: true }).fill(password)
    await outsiderPage.getByRole('button', { name: 'Create account' }).click()
    await expect(outsiderPage).toHaveURL(/\/worlds$/)
    await outsiderPage.goto(adventureUrl)
    await expect(outsiderPage.getByRole('heading', { name: 'Adventure not found' })).toBeVisible()
    await outsiderContext.close()

    if (testInfo.project.name.includes('mobile')) {
      await expect(page.getByRole('tab', { name: 'Story' })).toHaveAttribute(
        'aria-selected',
        'true'
      )
      await expectMobileTouchTarget(page.getByRole('tab', { name: 'Player' }), testInfo)
      await page.getByRole('tab', { name: 'Scene' }).click()
      await expect(page.getByRole('tabpanel', { name: 'Scene' })).toContainText('Mira')
      await page.getByRole('tab', { name: 'Story' }).click()
    } else {
      await expect(page.getByRole('region', { name: 'Player' })).toContainText(playerName)
      await expect(page.getByRole('region', { name: 'Scene' })).toContainText('Mira')
    }

    await page.getByLabel('What would you like to do?').fill('I ask why the bell rang.')
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByRole('status', { name: 'Resolving your turn' })).toBeVisible()
    await expect(page.getByText(actTurn)).toBeVisible({ timeout: 15_000 })
    if (testInfo.project.name.includes('mobile')) {
      await page.getByRole('tab', { name: 'Player' }).click()
      await expect(page.getByRole('tabpanel', { name: 'Player' })).toContainText('Vestry')
      await page.getByRole('tab', { name: 'Scene' }).click()
      await expect(page.getByRole('tabpanel', { name: 'Scene' })).toContainText('Vestry')
      await page.getByRole('tab', { name: 'Story' }).click()
    } else {
      await expect(page.getByRole('region', { name: 'Player' })).toContainText('Vestry')
      await expect(page.getByRole('region', { name: 'Scene' })).toContainText('Vestry')
    }

    const privateGuide = 'Let the ledger matter, but do not reveal why.'
    await page.getByRole('tab', { name: 'Guide' }).click()
    await page.getByLabel('Private direction for this turn').fill(privateGuide)
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByText(guideTurn)).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(privateGuide, { exact: true })).toHaveCount(0)

    await page.getByRole('button', { name: 'Pass' }).click()
    const passDialog = page.getByRole('dialog', { name: 'Pass this moment?' })
    await passDialog.getByRole('button', { name: 'Pass' }).click()
    await expect(page.getByText(passTurn)).toBeVisible({ timeout: 15_000 })

    const concurrentPage = await page.context().newPage()
    await concurrentPage.goto(adventureUrl)
    await expect(concurrentPage.getByLabel('What would you like to do?')).toBeVisible()
    await concurrentPage
      .getByLabel('What would you like to do?')
      .fill('I wait for the next bell toll.')
    await page
      .getByLabel('What would you like to do?')
      .fill('E2E_SLOW_TURN: I wait for the next bell toll.')
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByRole('status', { name: 'Resolving your turn' })).toBeVisible()
    await concurrentPage.getByRole('button', { name: 'Continue' }).click()
    await expect(concurrentPage.getByRole('alert')).toContainText('resolving turn')
    await page.reload()
    await expect(page.getByRole('status', { name: 'Resolving your turn' })).toBeVisible()
    await expect(page.getByText(actTurn, { exact: true })).toHaveCount(2, { timeout: 15_000 })
    await concurrentPage.close()

    await page
      .getByLabel('What would you like to do?')
      .fill('E2E_FAIL_TWICE: ask Mira about the ledger.')
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(
      page.getByRole('heading', { name: 'Your last turn did not change the story' })
    ).toBeVisible({
      timeout: 15_000,
    })
    await expect(page.getByText(actTurn, { exact: true })).toHaveCount(2)
    await expectVestryContext(page, testInfo)
    await page.getByRole('button', { name: 'Retry turn' }).click()
    await expect(page.getByText(actTurn, { exact: true })).toHaveCount(3, { timeout: 15_000 })

    await page
      .getByLabel('What would you like to do?')
      .fill('E2E_FAIL_ALWAYS: ask Mira about the ledger.')
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(
      page.getByRole('heading', { name: 'Your last turn did not change the story' })
    ).toBeVisible({
      timeout: 15_000,
    })
    await expect(page.getByText(actTurn, { exact: true })).toHaveCount(3)
    await expectVestryContext(page, testInfo)
    await page.getByRole('button', { name: 'Discard' }).click()
    await expect(page.getByLabel('What would you like to do?')).toBeVisible()
    await expect(page.getByText(actTurn, { exact: true })).toHaveCount(3)
    await expectVestryContext(page, testInfo)

    await page.getByRole('button', { name: 'Adventure settings' }).click()
    const settingsDialog = page.getByRole('dialog', { name: 'Adventure settings' })
    await settingsDialog.getByRole('button', { name: 'Reset Adventure' }).click()
    const resetDialog = page.getByRole('dialog', { name: 'Reset Adventure?' })
    await resetDialog.getByRole('button', { name: 'Reset Adventure' }).click()
    await expect(page).toHaveURL(adventureUrl)
    await expect(page.getByText('Preparing your opening')).toBeVisible()
    await expect(page.getByText(opening)).toBeVisible({ timeout: 15_000 })

    await page.getByRole('link', { name: 'Return to World' }).click()
    await page.getByRole('link', { name: 'Back to Worlds' }).click()
    const resume = page.getByRole('link', { name: `Resume Adventure as ${playerName}` })
    await expect(resume).toBeVisible()
    await expect(resume).toHaveText('Resume')
    await expect(page.getByText('0 turns')).toBeVisible()
    await resume.click()
    await expect(page).toHaveURL(adventureUrl)
    await expect(page.getByText(opening)).toBeVisible()
  } finally {
    await deleteAdventureIfPresent(page, playerName)
  }
})
