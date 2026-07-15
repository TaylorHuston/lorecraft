import { expect, type Locator, type Page, type TestInfo } from '@playwright/test'

export async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }))
    )
    .toEqual(
      await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.clientWidth,
      }))
    )
}

export async function expectMobileTouchTarget(locator: Locator, testInfo: TestInfo) {
  if (!testInfo.project.name.startsWith('mobile-')) {
    return
  }

  const bounds = await locator.boundingBox()
  expect(bounds, 'Expected the representative mobile control to have layout bounds.').not.toBeNull()
  expect(bounds!.width).toBeGreaterThanOrEqual(44)
  expect(bounds!.height).toBeGreaterThanOrEqual(44)
}
