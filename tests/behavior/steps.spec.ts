import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

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

async function checkScreen(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  const axe = await new AxeBuilder({ page })
    .include('main')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(
    axe.violations.flatMap((v) => v.nodes.map((n) => `${v.id} ${n.target.join(' ')}`)),
  ).toEqual([])
}
const next = (page: Page) => page.getByRole('button', { name: '다음', exact: true }).click()

for (const [width, height] of [
  [390, 844],
  [820, 1180],
  [1280, 800],
]) {
  test(`five representative stories play through at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))

    // C01 친구들과 함께 놀고 싶어요 (생활 정원)
    await page.goto('/area/A')
    await page.getByRole('button', { name: /친구들과 함께 놀고 싶어요/ }).click()
    await expect(page.getByRole('heading', { name: '상황을 살펴봐요' })).toBeFocused()
    await next(page)
    await page.getByRole('radio', { name: /서운해요/ }).click()
    await next(page)
    await page.getByRole('radio', { name: /모를 수도 있어요/ }).click()
    await next(page)
    // 친구와 대화하기: a line that did not go well, then better words.
    await page.getByRole('button', { name: '(아무 말 없이 친구들을 바라봐요.)' }).click()
    await expect(page.getByText(/용기 내어 말해 볼까요/)).toBeVisible()
    await page.getByRole('button', { name: '“나도 같이 놀아도 돼?”' }).click()
    // The friend "types" first; the reply and the next choices come a moment later.
    await expect(page.locator('.garden-chat__typing')).toBeVisible()
    await expect(page.getByText('응! 네가 함께 놀고 싶은 줄 몰랐어. 같이 하자!')).toHaveCount(0)
    await expect(page.getByRole('button', { name: '“고마워! 나는 뭐 하면 돼?”' })).toHaveCount(0)
    await expect(page.getByText('응! 네가 함께 놀고 싶은 줄 몰랐어. 같이 하자!')).toBeVisible()
    await expect(page.locator('.garden-chat__typing')).toHaveCount(0)
    // Me on the right, the friend on the left, inside the tinted 대화창.
    const meBox = (await page.locator('.garden-chat [data-speaker="me"] p').last().boundingBox())!
    const friendBox = (await page
      .locator('.garden-chat [data-speaker="friend"] p')
      .last()
      .boundingBox())!
    expect(meBox.x).toBeGreaterThan(friendBox.x)
    await expect(page.locator('.garden-chat-panel')).toHaveCSS(
      'background-color',
      'rgb(234, 244, 251)',
    )
    await checkScreen(page)
    await page.getByRole('button', { name: '“고마워! 나는 뭐 하면 돼?”' }).click()
    await expect(page.getByText(/나와 친구의 생각은 다를 수 있어요/)).toBeVisible()
    await next(page)
    await page.getByRole('radio', { name: /아직 알 수 없어요/ }).click()
    await page.getByRole('button', { name: '선택 확인하기' }).click()
    await page.getByRole('button', { name: '마무리하기' }).click()
    await expect(
      page.getByRole('heading', { name: '잘했어요! 오늘도 새로운 방법을 배웠어요.' }),
    ).toBeVisible()
    await checkScreen(page)

    // C05 나는 장난이었는데 친구는 속상해요 (학교)
    await page.goto('/area/C')
    await page.getByRole('button', { name: /나는 장난이었는데/ }).click()
    await next(page)
    await page.getByRole('radio', { name: /속상할 수 있어요/ }).click()
    await next(page)
    await page.getByRole('radio', { name: /돌려주고 미안하다고/ }).click()
    await page.getByRole('button', { name: '선택 확인하기' }).click()
    await next(page)
    // The repair talk can be skipped like any 상황별 미션.
    await page.getByRole('button', { name: '이 미션 건너뛰기' }).click()
    await page.getByRole('button', { name: '연필을 돌려줘요.' }).click()
    await page.getByRole('button', { name: '친구의 마음을 물어봐요.' }).click()
    await checkScreen(page)
    await page.getByRole('button', { name: '미안하다고 말해요.' }).click()
    await page.getByRole('button', { name: '확인하기' }).click()
    await expect(page.getByText(/관계를 회복하는 좋은 방법이에요/)).toBeVisible()
    await next(page)
    await page.getByRole('button', { name: '마무리하기' }).click()
    await expect(page.getByText('완료한 이야기 2 / 15')).toBeVisible()

    // C04 친구들이 내 발표를 놀렸어요 (자기인식): emotion → body → emotion–body link
    await page.getByRole('button', { name: '다른 이야기 만나기' }).click()
    await page.getByRole('button', { name: /친구들이 내 발표를 놀렸어요/ }).click()
    await next(page)
    await page.getByRole('radio', { name: /속상해요/ }).click()
    await next(page)
    await page.getByRole('radio', { name: /얼굴이 뜨거워져요/ }).click()
    await next(page)
    await page.getByRole('button', { name: '긴장돼요.' }).click()
    await page.getByRole('button', { name: '가슴이 두근거려요.' }).click()
    await expect(page.getByText(/긴장될 때 가슴이 두근거리는 사람이 있어요/)).toBeVisible()
    await checkScreen(page)
    await page.getByRole('button', { name: '완료하기' }).click()
    await expect(page.getByText('완료한 이야기 3 / 15')).toBeVisible()

    // B02 나도 할 말이 있어요 (자기관리): reason → action → sequence
    await page.goto('/episode/B02/play')
    await next(page)
    await page.getByRole('radio', { name: /재미있는 생각이/ }).click()
    await next(page)
    await page.getByRole('radio', { name: /손을 들고 내 차례를/ }).click()
    await page.getByRole('button', { name: '선택 확인하기' }).click()
    await next(page)
    for (const text of ['잠깐 멈춰요.', '손을 들어요.', '내 차례에 이야기해요.'])
      await page.getByRole('button', { name: text, exact: true }).click()
    await page.getByRole('button', { name: '확인하기' }).click()
    await page.getByRole('button', { name: '마무리하기' }).click()
    await expect(page.getByText('완료한 이야기 4 / 15')).toBeVisible()

    // D04 친구가 자꾸 새치기해요 (마음건강관리): feeling → coping → expression → help → practice
    await page.goto('/area/D')
    await page.getByRole('button', { name: /친구가 자꾸 새치기해요/ }).click()
    await next(page)
    await page.getByRole('radio', { name: /답답해요/ }).click()
    await next(page)
    await page.getByRole('radio', { name: /순서를 지켜달라고/ }).click()
    await page.getByRole('button', { name: '선택 확인하기' }).click()
    await next(page)
    await page.getByRole('radio', { name: /순서를 지켜줘/ }).click()
    await checkScreen(page)
    await page.getByRole('button', { name: '다음 상황 보기' }).click()
    await page.getByRole('radio', { name: /선생님에게 도움을/ }).click()
    await page.getByRole('button', { name: '말하기 연습하기' }).click()
    await page.getByRole('button', { name: /문장 듣기/ }).click()
    await page.getByRole('button', { name: /연습했어요/ }).click()
    await page.screenshot({ path: `.tmp/d04-practice-${width}.png`, fullPage: true })
    await checkScreen(page)
    await page.getByRole('button', { name: '마무리하기' }).click()
    await expect(page.getByText('완료한 이야기 5 / 15')).toBeVisible()
    await page.reload()
    await expect(page.getByText('완료한 이야기 5 / 15')).toBeVisible()
    await page.getByRole('button', { name: '탐험 지도로 돌아가기' }).click()
    await expect(page.getByRole('button', { name: /^학교, .*6개 중 3개 완료/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /^도움 쉼터, .*4개 중 1개 완료/ })).toBeVisible()
    expect(errors).toEqual([])
  })
}

for (const choice of ['A', 'C']) {
  test(`D04 nonrecommended ${choice}: feedback, hints, resume, reading-only completion and replay`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 820, height: 1180 })
    // No synthesis in this browser: the text path must remain complete.
    await page.addInitScript(() => {
      Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true })
      Object.defineProperty(window, 'SpeechSynthesisUtterance', {
        value: undefined,
        configurable: true,
      })
    })
    await page.goto('/episode/D04/play')
    const scene = page.locator('.garden-scene__frame img')
    await expect(scene).toHaveAttribute('src', '/img/generated/mind-lunch-line-800.webp')
    expect(await scene.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(
      0,
    )
    await next(page)
    for (const text of ['속상해요.', '답답해요.', '억울해요.']) {
      await page.getByRole('radio', { name: text, exact: true }).click()
      await expect(page.getByRole('radio', { name: text, exact: true })).toHaveAttribute(
        'aria-checked',
        'true',
      )
      await expect(page.getByText(/그런 마음이 들 수 있어요/)).toBeVisible()
    }
    await next(page)
    await page.getByRole('radio', { name: '선생님에게 도움을 요청해요.', exact: true }).click()
    await page.getByRole('button', { name: '선택 확인하기' }).click()
    await next(page)
    await page.getByRole('button', { name: '힌트 보기' }).click()
    await expect(page.locator('#expression-hint')).toBeVisible()
    await page
      .getByRole('radio')
      .nth(choice === 'A' ? 0 : 2)
      .click()
    await page.getByRole('button', { name: '다음 상황 보기' }).click()
    await page.reload()
    await expect(
      page.getByRole('heading', { name: '혼자 해결하기 어려울 때는 어떻게 하면 좋을까요?' }),
    ).toBeVisible()
    await page.getByRole('radio', { name: '계속 혼자 참아요.', exact: true }).click()
    await expect(page.getByText(/선생님에게 내 마음을 이야기해도 괜찮아요/)).toBeVisible()
    await page.getByRole('button', { name: '말하기 연습하기' }).click()
    await expect(page.locator('.garden-practice__listener img')).toBeVisible()
    if (choice === 'A') {
      await page.getByRole('button', { name: '문장 듣기', exact: true }).click()
      await expect(page.getByText(/이 기기에서는 소리를 들을 수 없어요/)).toBeVisible()
    }
    await page.reload()
    await expect(page.getByRole('heading', { name: '이렇게 말해보아요!' })).toBeFocused()
    await page.getByRole('button', { name: '연습했어요', exact: true }).click()
    await page.screenshot({ path: `.tmp/d04-practice-${choice}.png`, fullPage: true })
    await checkScreen(page)
    await page.getByRole('button', { name: '마무리하기' }).click()
    await expect(page.getByText('완료한 이야기 1 / 15')).toBeVisible()
    await page.getByRole('button', { name: '다시 연습하기' }).click()
    await expect(page.getByRole('heading', { name: '상황을 살펴봐요' })).toBeFocused()
    await page.getByRole('button', { name: '에피소드 목록으로 돌아가기' }).click()
    await expect(page.getByRole('button', { name: /친구가 자꾸 새치기해요/ })).toContainText('완료')
  })
}

test('incompatible step save is preserved until explicit restart; earlier completion stays', async ({
  page,
}) => {
  await page.goto('/episode/D04/play')
  const old = await page.evaluate(() => {
    const key = 'maumlink.steps.mvp-v1.D04'
    const saved = JSON.parse(localStorage.getItem(key)!)
    saved.contentVersion = 0
    const raw = JSON.stringify(saved)
    localStorage.setItem(key, raw)
    localStorage.setItem(
      'maumlink.progress.mvp-v2',
      JSON.stringify({ state: { completedEpisodeIds: ['D04'] }, version: 0 }),
    )
    return raw
  })
  await page.reload()
  await expect(page.getByRole('heading', { name: '활동을 이어갈 수 없어요' })).toBeFocused()
  expect(await page.evaluate(() => localStorage.getItem('maumlink.steps.mvp-v1.D04'))).toBe(old)
  await page.getByRole('button', { name: '처음부터 시작하기' }).click()
  await expect(page.getByRole('heading', { name: '상황을 살펴봐요' })).toBeFocused()
  await page.getByRole('button', { name: '에피소드 목록으로 돌아가기' }).click()
  await expect(page.getByRole('button', { name: /친구가 자꾸 새치기해요/ })).toContainText('완료')
})

test('storage full: completion still renders with an honest warning', async ({ page }) => {
  await page.goto('/episode/D04/play')
  await next(page)
  await page.getByRole('radio', { name: '속상해요.', exact: true }).click()
  await next(page)
  await page.getByRole('radio', { name: '선생님에게 도움을 요청해요.', exact: true }).click()
  await page.getByRole('button', { name: '선택 확인하기' }).click()
  await next(page)
  await page.getByRole('radio').nth(1).click()
  await page.getByRole('button', { name: '다음 상황 보기' }).click()
  await page.getByRole('radio').nth(2).click()
  await page.getByRole('button', { name: '말하기 연습하기' }).click()
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Full', 'QuotaExceededError')
    }
  })
  await page.getByRole('button', { name: '연습했어요', exact: true }).click()
  await expect(page.getByText(/이 기기에 활동을 저장할 수 없어요/)).toBeVisible()
  await page.getByRole('button', { name: '마무리하기' }).click()
  await expect(
    page.getByRole('heading', { name: '잘했어요! 오늘도 새로운 방법을 배웠어요.' }),
  ).toBeVisible()
  await expect(page.getByText(/완료 기록을 저장하지 못했어요/)).toBeVisible()
  await page.getByRole('button', { name: '다른 이야기 만나기' }).click()
  await expect(page.getByRole('heading', { name: '도움 쉼터' })).toBeVisible()
})
