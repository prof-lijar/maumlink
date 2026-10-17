import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const reason = '친구들이 같이 놀자고 이야기해 주지 않아서'
for (const width of [390, 820]) {
  test(`B01 feeling summary and all reasons survive a reload at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
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
    await page.goto('/episode/B01/play')
    await page.getByRole('button', { name: '다음', exact: true }).click()
    for (const feeling of ['화가 나요', '창피해요', '서운해요', '걱정돼요', '잘 모르겠어요.']) {
      await page.getByRole('radio', { name: feeling, exact: true }).click()
      await expect(page.getByText(reason, { exact: true })).toHaveCount(0)
      await page.getByRole('button', { name: '다음', exact: true }).click()
      const summary = page.getByRole('region', { name: '내가 고른 감정' })
      await expect(summary.getByRole('heading', { name: '내가 고른 감정' })).toBeVisible()
      await expect(summary.getByText(`‘${feeling.replace(/\.$/, '')}’를 골랐어요.`)).toBeVisible()
      const hurt = page.getByRole('radio', { name: `서운해요 ${reason}` })
      await expect(hurt).toBeVisible()
      await hurt.focus()
      await page.keyboard.press('Enter')
      await expect(hurt).toHaveAttribute('aria-checked', 'true')
      await expect(summary.getByText(reason, { exact: true })).toBeVisible()
      await expect(
        page.getByRole('heading', { name: '나와 너의 생각이 다를 수 있어!' }),
      ).toBeVisible()
      await page.reload()
      await expect(summary.getByText(`‘${feeling.replace(/\.$/, '')}’를 골랐어요.`)).toBeVisible()
      await expect(summary.getByText(reason, { exact: true })).toBeVisible()
      await expect(hurt).toHaveAttribute('aria-checked', 'true')
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
      if (feeling === '서운해요') {
        const result = await new AxeBuilder({ page })
          .include('main')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
        expect(result.violations).toEqual([])
        await summary.scrollIntoViewIfNeeded()
        await page.screenshot({ path: `.tmp/b01-reasons-${width}.png`, fullPage: true })
      }
      await page.getByRole('button', { name: '이전으로', exact: true }).click()
    }
    await page.getByRole('radio', { name: '서운해요', exact: true }).click()
    await page.getByRole('button', { name: '다음', exact: true }).click()
    await page.getByRole('radio', { name: /친구들이 거절할까 봐 걱정돼서/ }).click()
    await expect(
      page
        .getByRole('region', { name: '내가 고른 감정' })
        .getByText('친구들이 거절할까 봐 걱정돼서', { exact: true }),
    ).toBeVisible()
    await page.getByRole('button', { name: '다음', exact: true }).click()
    await expect(
      page.getByRole('heading', { name: '친구들과 함께 놀고 싶다면 어떻게 해볼 수 있을까요?' }),
    ).toBeVisible()
  })
}
