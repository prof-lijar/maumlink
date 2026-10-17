import { expect, test, type Locator, type Page } from '@playwright/test'

test.use({ isMobile: true, hasTouch: true, viewport: { width: 390, height: 664 } })

async function swipeUpFromCard(page: Page, card: Locator) {
  await card.evaluate((element) => element.scrollIntoView({ block: 'center' }))
  const box = (await card.boundingBox())!
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  const before = await page.evaluate(() => window.scrollY)
  const cdp = await page.context().newCDPSession(page)
  try {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x, y }],
    })
    for (let step = 1; step <= 10; step++) {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x, y: y - step * 16 }],
      })
      // Give the browser's native gesture recognizer time to distinguish a swipe from a tap.
      await page.waitForTimeout(20)
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before + 60)
  } finally {
    await cdp.detach()
  }
}

test('matching cards allow mobile scrolling without selecting and still support taps', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'maumlink.settings.v1',
      JSON.stringify({
        state: { started: true, voiceEnabled: false, autoRead: false, voiceInput: false },
        version: 0,
      }),
    )
    localStorage.setItem(
      'maumlink.profile.mvp-v1',
      JSON.stringify({ state: { avatarId: 'sora' }, version: 0 }),
    )
  })
  await page.goto('/episode/A01/play')
  await page.getByRole('button', { name: '다음', exact: true }).tap()
  await page.getByRole('radio', { name: '속상해요', exact: true }).tap()
  await page.getByRole('button', { name: '다음', exact: true }).tap()
  await page.getByRole('radio', { name: /가슴이 쿵쿵 뛴다/ }).tap()
  await page.getByRole('button', { name: '다음', exact: true }).tap()

  const emotion = page.locator('.garden-match__card').filter({ hasText: '긴장돼요' })
  const body = page.locator('.garden-match__card[data-side="body"]').filter({
    hasText: '가슴이 쿵쿵 뛴다',
  })
  const links = page.locator('.garden-match__lines line')
  await expect(body).toBeDisabled()
  await swipeUpFromCard(page, body)
  await expect(links).toHaveCount(0)
  await swipeUpFromCard(page, emotion)
  await expect(emotion).toHaveAttribute('aria-pressed', 'false')
  await expect(links).toHaveCount(0)

  await emotion.tap()
  await expect(emotion).toHaveAttribute('aria-pressed', 'true')
  await expect(body).toBeEnabled()
  await swipeUpFromCard(page, body)
  await expect(links).toHaveCount(0)
  await expect(emotion).toHaveAttribute('aria-pressed', 'true')
  await body.tap()
  await expect(links).toHaveCount(1)
  await expect(
    page.locator('main').getByText(/긴장될 때 가슴이 쿵쿵 뛰고 입술이 마르는 사람이 있어요/),
  ).toBeVisible()

  // Keyboard activation stays available alongside mobile taps and scrolling.
  await emotion.focus()
  await page.keyboard.press('Enter')
  await body.focus()
  await page.keyboard.press('Enter')
  await expect(links).toHaveCount(1)
  await expect(page.getByRole('button', { name: '완료하기', exact: true })).toBeEnabled()
})
