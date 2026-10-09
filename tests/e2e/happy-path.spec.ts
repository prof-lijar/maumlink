import { expect, test } from '@playwright/test'
import {
  gotoHome,
  loadScenarios,
  openScenario,
  pickAction,
  playLesson,
  seedSettings,
} from './helpers'

const scenarios = loadScenarios()

test.describe('Start gate (FR-HOME-01)', () => {
  test('first visit shows 시작하기, then the character pick, then Home', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: '시작하기' })).toBeVisible()
    await page.getByRole('button', { name: '시작하기' }).click()
    // The companion pick is one extra tap with a safe default; 소라 is remembered after reload.
    await expect(page.getByRole('heading', { level: 1 })).toContainText('나의 캐릭터')
    await page.getByRole('radio', { name: '소라' }).click()
    await page.getByTestId('character-next').click()
    await expect(page.getByRole('heading', { level: 1 })).toContainText('오늘은 어떤 마음을')
    await expect(page.getByRole('img', { name: '소라' }).first()).toBeVisible()
    await page.reload()
    await expect(page.getByRole('button', { name: '시작하기' })).toHaveCount(0)
    await expect(page.getByRole('img', { name: '소라' }).first()).toBeVisible()
  })
})

for (const scenario of scenarios) {
  test.describe(`lesson: ${scenario.id}`, () => {
    test.beforeEach(async ({ page }) => seedSettings(page))

    test('recommended path completes to wrap-up and marks done', async ({ page }) => {
      await gotoHome(page)
      await openScenario(page, scenario)
      await playLesson(page, scenario, { tellMore: true })
      await page.getByTestId('wrapup-home').click()
      await expect(page).toHaveURL(/\/$/)
      await expect(page.locator(`[data-domain="${scenario.domain}"]`)).toContainText('완료')
    })

    test('every feeling option reaches source-backed step 3', async ({ page }) => {
      await gotoHome(page)
      await openScenario(page, scenario)
      for (let i = 0; i < scenario.situation.story.length + 1; i++)
        await page.getByTestId('nav-primary').click()
      for (const id of scenario.feeling.options) {
        if (id === 'not-sure') continue
        await page.locator(`[data-emotion="${id}"]`).click()
        await page.getByTestId('nav-primary').click()
        if (scenario.step3.type !== 'multiple-choice') {
          const text =
            scenario.step3.type === 'reason'
              ? scenario.step3.byFeeling[id]!
              : scenario.step3.byFeeling[id]?.text
          if (text) await expect(page.getByRole('main')).toContainText(text.ko.slice(0, 8))
          else {
            expect(scenario.step3.sourceOmissions).toContain(id)
            await expect(page.getByRole('heading', { level: 1 })).toHaveText(
              scenario.step3.question.ko,
            )
            await expect(page.getByTestId('nav-primary')).toBeEnabled()
          }
        }
        await page.getByTestId('nav-back').click()
        await page.locator(`[data-emotion="${id}"]`).click() // deselect
      }
    })

    test('every action shows its own feedback; reconsider (or explore mode) offers "try another way" (FR-S5-02)', async ({
      page,
    }) => {
      await gotoHome(page)
      await openScenario(page, scenario)
      for (let i = 0; i < scenario.situation.story.length + 1; i++)
        await page.getByTestId('nav-primary').click()
      await page.locator(`[data-emotion="${scenario.feeling.options[0]}"]`).click()
      await page.getByTestId('nav-primary').click()
      if (scenario.step3.type === 'multiple-choice') await page.locator('[data-option="A"]').click()
      await page.getByTestId('nav-primary').click()
      for (const o of scenario.action.options) {
        await page.locator(`[data-option="${o.id}"]`).click()
        await page.getByTestId('nav-primary').click()
        await expect(page.getByTestId('feedback-card')).toContainText(o.feedback.ko.slice(0, 10))
        const tryAnother = page.getByTestId('nav-try-another')
        // Explore lessons (자기 인식) invite trying every coping idea until all four are tried.
        const lastToExplore = o.id === scenario.action.options.at(-1)!.id
        if (o.quality === 'reconsider' || (scenario.action.explore && !lastToExplore)) {
          await expect(tryAnother).toBeVisible()
          await tryAnother.click()
          await expect(page.locator(`[data-option="${o.id}"]`)).toBeVisible()
        } else {
          await expect(tryAnother).toHaveCount(0)
          await page.getByTestId('nav-back').click()
        }
      }
      // Child never sees a negative marker anywhere on the path (acceptance §14.3)
      const body = await page.locator('body').innerText()
      expect(body).not.toMatch(/틀렸|오답|실패|wrong|✗|✕/)
    })
  })
}

test.describe('cross-cutting', () => {
  const scenario = scenarios[0]!
  test.beforeEach(async ({ page }) => seedSettings(page))

  test('refresh mid-lesson restores the exact screen (FR-ENG-03)', async ({ page }) => {
    await gotoHome(page)
    await openScenario(page, scenario)
    for (let i = 0; i < scenario.situation.story.length + 1; i++)
      await page.getByTestId('nav-primary').click()
    const feeling = scenario.feeling.options[1]!
    await page.locator(`[data-emotion="${feeling}"]`).click()
    await page.getByTestId('nav-primary').click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(scenario.step3.question.ko)
    await page.reload()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(scenario.step3.question.ko)
    await page.getByTestId('nav-back').click()
    await expect(page.locator(`[data-emotion="${feeling}"]`)).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })

  test('Home from a lesson asks for confirmation', async ({ page }) => {
    await gotoHome(page)
    await openScenario(page, scenario)
    await page.getByRole('button', { name: '처음으로' }).first().click()
    await expect(page.getByRole('dialog')).toContainText('처음으로 갈까요?')
    await page.getByTestId('confirm-no').click()
    await expect(page.getByTestId('story-card')).toBeVisible()
    await page.getByRole('button', { name: '처음으로' }).first().click()
    await page.getByTestId('confirm-yes').click()
    await expect(page).toHaveURL(/\/$/)
  })

  test('disabled Next does not advance; help opens the hint; suggestion selects (FR-S2-02/03)', async ({
    page,
  }) => {
    await gotoHome(page)
    await openScenario(page, scenario)
    for (let i = 0; i < scenario.situation.story.length + 1; i++)
      await page.getByTestId('nav-primary').click()
    await page.getByTestId('nav-primary').click({ force: true })
    await expect(page.locator('[data-emotion]').first()).toBeVisible() // still on S2
    await page.getByTestId('nav-help').click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toContainText(scenario.feeling.hint.text.ko.slice(0, 8))
    await dialog.locator(`[data-emotion="${scenario.feeling.hint.suggest[0]}"]`).click()
    await expect(dialog).toHaveCount(0)
    await expect(
      page.locator(`[data-emotion="${scenario.feeling.hint.suggest[0]}"]`),
    ).toHaveAttribute('aria-checked', 'true')
  })

  test('"not sure" twice auto-selects the first suggestion (FR-S2-05)', async ({ page }) => {
    await gotoHome(page)
    await openScenario(page, scenario)
    for (let i = 0; i < scenario.situation.story.length + 1; i++)
      await page.getByTestId('nav-primary').click()
    await page.locator('[data-emotion="not-sure"]').click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: '닫기' }).click()
    await page.locator('[data-emotion="not-sure"]').click()
    await expect(
      page.locator(`[data-emotion="${scenario.feeling.hint.suggest[0]}"]`),
    ).toHaveAttribute('aria-checked', 'true')
  })

  test('settings persist and apply immediately (FR-SET-01)', async ({ page }) => {
    await gotoHome(page)
    await page.getByRole('button', { name: '설정' }).click()
    await page.getByRole('radio', { name: '크게' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-text', 'large')
    await page.getByRole('button', { name: '닫기' }).click()
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-text', 'large')
    await expect(page.getByRole('combobox', { name: '언어' })).toHaveCount(0) // D17: no language control
    await expect(page.getByText('언어', { exact: true })).toHaveCount(0)
  })

  test('?lang=en renders English with Korean fallback (FR-ENG-05, dev only)', async ({ page }) => {
    await page.goto('/?lang=en')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Which feeling')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })

  test('works offline after first load (FR-PWA-02)', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'service worker assertions run on Chromium')
    await gotoHome(page)
    await page.evaluate(() => navigator.serviceWorker.ready)
    // Let the precache finish.
    await page.waitForFunction(async () => {
      const keys = await caches.keys()
      if (!keys.length) return false
      const c = await caches.open(keys.find((k) => k.includes('precache')) ?? keys[0]!)
      return (await c.keys()).length > 10
    })
    await context.setOffline(true)
    await page.reload()
    await expect(page.getByRole('heading', { level: 1 })).toContainText('오늘은 어떤 마음을')
    await openScenario(page, scenario)
    await playLesson(page, scenario, { action: pickAction(scenario, 'recommended') })
    await context.setOffline(false)
  })
})
