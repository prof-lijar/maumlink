import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import type { BehaviorEpisode } from '../../src/content/behaviorSchema'

const root = join(import.meta.dirname, '../../content/episodes')
const episodes = readdirSync(root)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(root, f), 'utf8')))
  // Step-format episodes (B02, C01, C04, C05, D04) have their own flow; see steps.spec.ts.
  .filter((e) => e.format !== 'steps') as BehaviorEpisode[]
const c02 = episodes.find((e) => e.id === 'C02')!

async function startSorting(page: Page, episode: BehaviorEpisode) {
  await page.goto(`/episode/${episode.id}/play`)
  await page
    .getByRole('radio', {
      name: episode.choice.choices.find((c) => c.id === episode.choice.modelChoiceId)!.text,
      exact: true,
    })
    .click()
  await page.getByRole('button', { name: '선택 확인하기', exact: true }).click()
  const talk = (
    episode as BehaviorEpisode & {
      conversation?: { turns: { options: { text: string; good: boolean }[] }[] }
    }
  ).conversation
  if (talk) {
    // 친구와 대화하기 (C02, C03, D02): say a good line on each turn.
    await page.getByRole('button', { name: '친구와 대화하기로', exact: true }).click()
    for (const turn of talk.turns)
      await page
        .getByRole('button', { name: turn.options.find((o) => o.good)!.text, exact: true })
        .click()
  }
  await page.getByRole('button', { name: '좋은 행동 나누기로', exact: true }).click()
  await expect(page.getByRole('heading', { name: '행동을 나눠 봐요' })).toBeFocused()
}
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('maumlink.settings.v1')) {
      localStorage.setItem(
        'maumlink.settings.v1',
        JSON.stringify({
          state: { started: true, voiceEnabled: false, autoRead: false },
          version: 0,
        }),
      )
      localStorage.setItem(
        'maumlink.profile.mvp-v1',
        JSON.stringify({ state: { avatarId: 'sky' }, version: 0 }),
      )
    }
  })
})

test('all 10 choice + sorting stories complete choice and sorting; partial reload, correction, and progress deduplication', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  for (const episode of episodes) {
    await startSorting(page, episode)
    await expect(page.getByRole('button', { name: '나눈 내용 확인하기' })).toBeDisabled()
    for (const [index, card] of [...episode.sorting.cards].reverse().entries()) {
      await page.getByRole('button', { name: card.text, exact: true }).click()
      await page
        .getByRole('button', {
          name: card.category === 'do' ? '이렇게 해요' : '안돼요',
          exact: true,
        })
        .click()
      if (index === 0) {
        await page.reload()
        await expect(page.getByText('4장 중 1장을 나눴어요.', { exact: true })).toBeVisible()
      }
    }
    await page.getByRole('button', { name: '나눈 내용 확인하기' }).click()
    await expect(page.getByText('모두 알맞게 나눴어요!')).toBeVisible()
    await noOverflow(page)
    await page.getByRole('button', { name: '다음', exact: true }).click()
    await expect(page.getByRole('heading', { name: '행동을 나눴어요' })).toBeFocused()
    await page.getByRole('button', { name: '오늘 배운 내용 보기' }).click()
    await expect(
      page.getByRole('heading', { name: '잘했어요! 오늘도 새로운 방법을 배웠어요.' }),
    ).toBeVisible()
  }
  await expect(page.getByText('완료한 이야기 10 / 15')).toBeVisible()
  await expect(page.getByText('67%', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '다시 연습하기' }).click()
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem('maumlink.progress.mvp-v2')!).state.completedEpisodeIds
            .length,
      ),
    )
    .toBe(10)
  expect(errors).toEqual([])
})

for (const width of [320, 390, 768]) {
  test(`sorting correction, model, keyboard and layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await startSorting(page, c02)
    await noOverflow(page)
    if (width === 390) {
      const report = await new AxeBuilder({ page })
        .include('.garden-sort-guide')
        .include('.garden-sort-cards')
        .include('.garden-sort-zones')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
      expect(report.violations).toEqual([])
    }
    await page.screenshot({ path: `.tmp/sorting-${width}.png`, fullPage: true })
    // Keyboard activation moves focus to the first basket on the next animation frame.
    // Wait for that contract rather than racing it with additional Tab key presses.
    await page.getByRole('button', { name: c02.sorting.cards[0]!.text, exact: true }).focus()
    await page.keyboard.press('Space')
    await expect(page.getByRole('button', { name: '이렇게 해요', exact: true })).toBeFocused()
    await page.keyboard.press('Enter')
    for (const card of c02.sorting.cards.slice(1)) {
      await page.getByRole('button', { name: card.text, exact: true }).click()
      await page.getByRole('button', { name: '이렇게 해요', exact: true }).click()
    }
    await page.getByRole('button', { name: '나눈 내용 확인하기' }).click()
    await expect(page.getByText('이 카드를 다시 살펴봐요.')).toBeVisible()
    const first = c02.sorting.cards[0]!
    await page.getByRole('button', { name: first.text, exact: true }).click()
    await page.getByRole('button', { name: '안돼요', exact: true }).click()
    await page.getByRole('button', { name: '예시 보기' }).click()
    await page.getByRole('button', { name: '예시대로 나누기' }).click()
    await expect(page.getByRole('button', { name: '다음', exact: true })).toHaveCount(0)
    await page.getByRole('button', { name: '나눈 내용 확인하기' }).click()
    await page.getByRole('button', { name: '다음', exact: true }).click()
    await noOverflow(page)
    await page.screenshot({ path: `.tmp/sorting-review-${width}.png`, fullPage: true })
    if (width === 390) {
      const report = await new AxeBuilder({ page })
        .include('.garden-sort-review')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
      expect(report.violations).toEqual([])
    }
  })
}

test('200 percent text remains operable, and old sessions are preserved until explicit restart', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 })
  await page.goto('/')
  const old = JSON.stringify({
    packId: 'mvp-v1',
    episodeId: c02.id,
    contentVersion: c02.version - 1,
    state: { step: 'sequence', orderIds: [] },
  })
  await page.evaluate((value) => localStorage.setItem('maumlink.session.mvp-v1.C02', value), old)
  await page.goto('/episode/C02/play')
  await expect(page.getByRole('heading', { name: '활동을 이어갈 수 없어요' })).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('maumlink.session.mvp-v1.C02'))).toBe(old)
  await page.getByRole('button', { name: '처음부터 시작하기' }).click()
  await page.getByRole('radio', { name: c02.choice.choices[1]!.text, exact: true }).click()
  await page.getByRole('button', { name: '선택 확인하기' }).click()
  await page.getByRole('button', { name: '친구와 대화하기로' }).click()
  await page.evaluate(() => document.documentElement.style.setProperty('--gs', '2'))
  // The conversation stays usable at 200% text, and skipping it still leads to sorting.
  await page.getByRole('button', { name: c02.conversation!.turns[0]!.options[2]!.text }).click()
  await noOverflow(page)
  await page.getByRole('button', { name: '이 미션 건너뛰기' }).click()
  await noOverflow(page)
  await page.getByRole('button', { name: '예시 보기' }).click()
  await page.getByRole('button', { name: '예시대로 나누기' }).click()
  await noOverflow(page)
  await page.getByRole('button', { name: '나눈 내용 확인하기' }).click()
  await page.getByRole('button', { name: '다음', exact: true }).click()
  await noOverflow(page)
  await page.screenshot({ path: '.tmp/sorting-text-200.png', fullPage: true })
})

test.describe('pointer dragging', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } })

  test('panels accept mouse/touch drops, show the card inside, and keep it on canceled drops', async ({
    page,
  }) => {
    await startSorting(page, c02)
    const text = c02.sorting.cards[0]!.text
    const card = page.getByRole('button', { name: text, exact: true })
    const zone = (category: 'do' | 'rethink') =>
      page.locator(`.garden-sort-zone[data-category="${category}"]`)
    const inZone = (category: 'do' | 'rethink') =>
      zone(category).getByRole('button', { name: text, exact: true })
    const center = async (locator: ReturnType<typeof page.locator>) => {
      const box = (await locator.boundingBox())!
      return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
    }
    const target = await center(zone('rethink'))
    const source = await center(card)
    expect(target.y).toBeLessThan(source.y)
    await page.mouse.move(source.x, source.y)
    await page.mouse.down()
    await page.mouse.move(target.x, target.y, { steps: 12 })
    await expect(zone('rethink')).toHaveAttribute('data-over', 'true')
    await expect(page.locator('.garden-sort-ghost')).toBeVisible()
    await page.screenshot({ path: '.tmp/sorting-drag-hover.png' })
    await page.mouse.up()
    await expect(inZone('rethink')).toBeVisible()
    await expect(card).toHaveAttribute('aria-pressed', 'false')
    await expect(page.locator('.garden-sort-ghost')).toHaveCount(0)
    // Outside drop and Escape both leave the card in its panel.
    let from = await center(card)
    await page.mouse.move(from.x, from.y)
    await page.mouse.down()
    await page.mouse.move(5, from.y + 200, { steps: 8 })
    await page.mouse.up()
    await expect(inZone('rethink')).toBeVisible()
    from = await center(card)
    const doZone = await center(zone('do'))
    await page.mouse.move(from.x, from.y)
    await page.mouse.down()
    await page.mouse.move(doZone.x, doZone.y, { steps: 8 })
    await page.keyboard.press('Escape')
    await page.mouse.up()
    await expect(inZone('rethink')).toBeVisible()
    // Native touch events move the placed card to the other panel.
    const session = await page.context().newCDPSession(page)
    from = await center(card)
    const to = await center(zone('do'))
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: from.x, y: from.y }],
    })
    for (let step = 1; step <= 10; step++)
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [
          { x: from.x + ((to.x - from.x) * step) / 10, y: from.y + ((to.y - from.y) * step) / 10 },
        ],
      })
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await expect(inZone('do')).toBeVisible()
    from = await center(card)
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: from.x, y: from.y }],
    })
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: from.x, y: from.y + 150 }],
    })
    await session.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] })
    await expect(inZone('do')).toBeVisible()
    await expect(page.locator('.garden-sort-ghost')).toHaveCount(0)
    await page.reload()
    await expect(inZone('do')).toBeVisible()
    // The last card can still be dragged up into a panel after scrolling.
    const lastText = c02.sorting.cards[3]!.text
    const last = page.getByRole('button', { name: lastText, exact: true })
    await last.scrollIntoViewIfNeeded()
    from = await center(last)
    const up = await center(zone('rethink'))
    await page.mouse.move(from.x, from.y)
    await page.mouse.down()
    await page.mouse.move(up.x, Math.max(up.y, 100), { steps: 12 })
    await page.mouse.up()
    await expect(zone('rethink').getByRole('button', { name: lastText, exact: true })).toBeVisible()
    await noOverflow(page)
    await session.detach()
  })
})
