/**
 * Accessibility audit — PRD §6.12 / §9. Runs axe-core on every screen of every scenario
 * (plus the start gate, home, hint and settings sheets) and fails on any WCAG 2.x A/AA
 * violation. Complements the manual VoiceOver/TalkBack checks in TABLET_TEST_CHECKLIST.md.
 */
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { gotoHome, loadScenarios, openScenario, playLesson, seedSettings } from './helpers'

const scenarios = loadScenarios()

async function audit(page: Page, label: string) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .analyze()
  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  )
  const summary = results.violations.map(
    (v) =>
      `${v.impact}: ${v.id} — ${v.help} (${v.nodes.length}) e.g. ${v.nodes[0]?.target.join(' ')}`,
  )
  expect(serious, `${label}: serious/critical axe violations:\n${summary.join('\n')}`).toEqual([])
  expect(results.violations, `${label}: axe violations:\n${summary.join('\n')}`).toEqual([])
}

test('start gate and home', async ({ page }) => {
  await page.goto('/')
  await audit(page, 'start-gate')
  await page.getByRole('button', { name: '시작하기' }).click()
  await audit(page, 'character-pick')
  await page.getByTestId('character-next').click()
  await audit(page, 'home')
  await page.getByRole('button', { name: '설정' }).click()
  await audit(page, 'settings-sheet')
})

for (const scenario of scenarios) {
  test(`every screen of ${scenario.id}`, async ({ page }) => {
    await seedSettings(page)
    await gotoHome(page)
    await openScenario(page, scenario)
    await playLesson(page, scenario, {
      tellMore: true,
      onScreen: async (screen) => {
        await audit(page, `${scenario.id}/${screen}`)
        if (screen === 'feeling') {
          await page.getByTestId('nav-help').click()
          await audit(page, `${scenario.id}/hint`)
          await page.getByRole('button', { name: '닫기' }).click()
        }
      },
    })
  })
}
