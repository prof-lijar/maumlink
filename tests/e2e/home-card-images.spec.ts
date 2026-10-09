import { expect, test } from '@playwright/test'
import { gotoHome, loadScenarios, seedSettings } from './helpers'
import { VIEWPORTS } from './viewports'

/** Home is a village map: every learning area shows its landmark picture and label. */
for (const vp of VIEWPORTS) {
  for (const textSize of ['normal', 'large'] as const) {
    test.describe(`village landmarks ${vp.name} ${textSize}`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } })
      test('each place shows its picture, name and completion badge', async ({ page }) => {
        await seedSettings(page, { textSize })
        await page.addInitScript(
          (ids) => {
            const entries = Object.fromEntries(
              ids.map((id) => [id, { times: 1, completedAt: '2026-10-03T00:00:00.000Z' }]),
            )
            localStorage.setItem(
              'maumlink.progress.v1',
              JSON.stringify({ state: { entries }, version: 0 }),
            )
          },
          loadScenarios().map((s) => s.id),
        )
        await gotoHome(page)
        await page.mouse.move(0, 0)
        await page.evaluate(() => document.fonts.ready)
        const cards = page.locator('.place-card:not(:disabled)')
        await expect(cards).toHaveCount(4)
        for (const card of await cards.all()) {
          await card.scrollIntoViewIfNeeded()
          await expect(card.locator('.domain-completed')).toBeVisible()
          const image = card.locator('.place-art > img')
          await expect(image).toBeVisible()
          await expect
            .poll(() => image.evaluate((el) => (el as HTMLImageElement).naturalWidth))
            .toBeGreaterThan(0)
          await expect(card.locator('.place-name')).toBeVisible()
          const c = (await card.boundingBox())!
          const img = (await image.boundingBox())!
          expect(img.width, `${vp.name}/${textSize}: landmark width`).toBeGreaterThanOrEqual(96)
          expect(img.x).toBeGreaterThanOrEqual(c.x - 1)
          expect(img.x + img.width).toBeLessThanOrEqual(c.x + c.width + 1)
        }
      })
    })
  }
}
