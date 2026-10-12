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
        JSON.stringify({ state: { avatarId: 'sora' }, version: 0 }),
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
  test(`the five reviewed stories play through at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))

    // B01 친구들과 함께 놀고 싶어요 (관계 인식)
    await page.goto('/area/B')
    await page.getByRole('button', { name: /친구들과 함께 놀고 싶어요/ }).click()
    await expect(page.getByRole('heading', { name: '상황을 살펴봐요' })).toBeFocused()
    await next(page)
    await page.getByRole('radio', { name: '서운해요' }).click()
    await next(page)
    await page.getByRole('radio', { name: /거절할까 봐/ }).click()
    await next(page)
    await page.getByRole('radio', { name: /나도 같이 놀아도 돼\?”라고 물어봐요/ }).click()
    await page.getByRole('button', { name: '선택 확인하기' }).click()
    await next(page)
    // 친구와 대화하기: a line that did not go well, then better words.
    await page.getByRole('button', { name: '(아무 말 없이 친구들을 바라봐요.)' }).click()
    await expect(page.locator('main').getByText(/용기 내어 말해 볼까요/)).toBeVisible()
    await page.getByRole('button', { name: '“나도 같이 놀아도 돼?”' }).click()
    // The friend "types" first; the reply and the next choices come a moment later.
    await expect(page.locator('.garden-chat__typing')).toBeVisible()
    await expect(
      page.locator('main').getByText('응! 네가 함께 놀고 싶은 줄 몰랐어. 같이 하자!'),
    ).toHaveCount(0)
    await expect(page.getByRole('button', { name: '“고마워! 나는 뭐 하면 돼?”' })).toHaveCount(0)
    await expect(
      page.locator('main').getByText('응! 네가 함께 놀고 싶은 줄 몰랐어. 같이 하자!'),
    ).toBeVisible()
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
    await expect(page.locator('main').getByText(/나와 친구의 생각은 다를 수 있어요/)).toBeVisible()
    await next(page)
    await page.getByRole('radio', { name: /아직 알 수 없어요/ }).click()
    await page.getByRole('button', { name: '선택 확인하기' }).click()
    await page.getByRole('button', { name: '마무리하기' }).click()
    await expect(
      page.getByRole('heading', { name: '잘했어요! 오늘도 새로운 방법을 배웠어요.' }),
    ).toBeVisible()
    await checkScreen(page)

    // C01 나는 장난이었는데, 친구는 속상해요 (관계 관리)
    await page.goto('/area/C')
    await page.getByRole('button', { name: /나는 장난이었는데/ }).click()
    await next(page)
    await page.getByRole('radio', { name: '속상해요' }).click()
    await next(page)
    await page.getByRole('radio', { name: /연필을 찾지 못해/ }).click()
    await next(page)
    await page.getByRole('radio', { name: /연필을 돌려주고/ }).click()
    await page.getByRole('button', { name: '선택 확인하기' }).click()
    await next(page)
    // The repair talk can be skipped like any 상황별 미션.
    await page.getByRole('button', { name: '이 미션 건너뛰기' }).click()
    await page.getByRole('button', { name: '연필을 돌려줘요.' }).click()
    await page.getByRole('button', { name: '친구의 마음을 물어봐요.' }).click()
    await checkScreen(page)
    await page.getByRole('button', { name: '미안하다고 말해요.' }).click()
    await page.getByRole('button', { name: '확인하기' }).click()
    await expect(page.locator('main').getByText(/관계를 회복하는 좋은 방법이에요/)).toBeVisible()
    await next(page)
    await page.getByRole('button', { name: '마무리하기' }).click()
    await expect(page.locator('main').getByText('완료한 이야기 2 / 5')).toBeVisible()

    // A01 친구들이 내 발표 실수를 듣고 놀린다 (자기 인식): emotion → body → emotion–body link
    await page.goto('/area/A')
    await page.getByRole('button', { name: /친구들이 내 발표 실수를/ }).click()
    await next(page)
    await page.getByRole('radio', { name: '속상해요' }).click()
    await next(page)
    await page.getByRole('radio', { name: /눈이 뜨거워지고/ }).click()
    await next(page)
    await page.getByRole('button', { name: '긴장돼요', exact: true }).click()
    await page.getByRole('button', { name: '가슴이 쿵쿵 뛴다, 입술이 마른다.' }).click()
    await expect(
      page.locator('main').getByText(/긴장될 때 가슴이 쿵쿵 뛰고 입술이 마르는 사람이 있어요/),
    ).toBeVisible()
    await checkScreen(page)
    await page.getByRole('button', { name: '완료하기' }).click()
    await page.getByRole('radio', { name: /혼자서 산책하기/ }).click()
    await page.getByRole('button', { name: '마무리하기' }).click()
    await expect(page.locator('main').getByText('완료한 이야기 3 / 5')).toBeVisible()

    // D01 내 차례인데 친구가 새치기를 했어요 (마음건강관리): feeling → coping → expression → help → practice
    await page.goto('/area/D')
    await page.getByRole('button', { name: /내 차례인데 친구가 새치기를/ }).click()
    await next(page)
    await page.getByRole('radio', { name: '답답해요' }).click()
    await next(page)
    await page.getByRole('radio', { name: /말이 잘 안나와서/ }).click()
    await next(page)
    await page.getByRole('radio', { name: /바라는 것 말하기/ }).click()
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
    await expect(page.locator('main').getByText('완료한 이야기 4 / 5')).toBeVisible()
    await page.reload()
    await expect(page.locator('main').getByText('완료한 이야기 4 / 5')).toBeVisible()

    // E01 선생님 설명 중 하고 싶은 말이 떠올랐어요 (자기관리): every pick accepted, two-panel scene
    await page.goto('/area/E')
    await page.getByRole('button', { name: /하고 싶은 말이 떠올랐어요/ }).click()
    await expect(page.locator('.garden-scene__frame img')).toHaveCount(2)
    await next(page)
    await page.getByRole('radio', { name: '아쉬워요' }).click()
    await next(page)
    await page.getByRole('radio', { name: /지금 들려주고 싶어서/ }).click()
    await next(page)
    await page.getByRole('radio', { name: /새로운 생각이 잘 떠올라요/ }).click()
    await checkScreen(page)
    await next(page)
    await page.getByRole('radio', { name: /먼저 선생님 말씀을/ }).click()
    await page.getByRole('button', { name: '마무리하기' }).click()
    await expect(page.locator('main').getByText('완료한 이야기 5 / 5')).toBeVisible()
    await page.getByRole('button', { name: '탐험 지도로 돌아가기' }).click()
    for (const area of ['자기 인식', '관계 인식', '관계 관리', '마음건강관리', '자기관리'])
      await expect(
        page.getByRole('button', { name: new RegExp(`^${area}, .*1개 중 1개 완료`) }),
      ).toBeVisible()
    expect(errors).toEqual([])
  })
}

for (const choice of ['A', 'C']) {
  test(`D01 nonrecommended ${choice}: feedback, hints, resume, reading-only completion and replay`, async ({
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
    await page.goto('/episode/D01/play')
    const scene = page.locator('.garden-scene__frame img')
    await expect(scene).toHaveAttribute('src', '/img/v3/scene-mind-lunch-line-800.webp')
    expect(await scene.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(
      0,
    )
    await next(page)
    for (const text of ['속상해요', '답답해요', '억울해요']) {
      await page.getByRole('radio', { name: text, exact: true }).click()
      await expect(page.getByRole('radio', { name: text, exact: true })).toHaveAttribute(
        'aria-checked',
        'true',
      )
      await expect(page.locator('main').getByText(/그런 마음이 들 수 있어요/)).toBeVisible()
    }
    await next(page)
    await page.getByRole('radio').first().click()
    await next(page)
    await page.getByRole('radio', { name: /도움 요청하기/ }).click()
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
    await expect(
      page.locator('main').getByText(/선생님에게 내 마음을 이야기해도 괜찮아요/),
    ).toBeVisible()
    await page.getByRole('button', { name: '말하기 연습하기' }).click()
    await expect(page.locator('.garden-practice__listener img')).toBeVisible()
    if (choice === 'A') {
      await page.getByRole('button', { name: '문장 듣기', exact: true }).click()
      await expect(
        page.locator('main').getByText(/이 기기에서는 소리를 들을 수 없어요/),
      ).toBeVisible()
    }
    await page.reload()
    await expect(page.getByRole('heading', { name: '이렇게 말해보아요!' })).toBeFocused()
    await page.getByRole('button', { name: '연습했어요', exact: true }).click()
    await page.screenshot({ path: `.tmp/d04-practice-${choice}.png`, fullPage: true })
    await checkScreen(page)
    await page.getByRole('button', { name: '마무리하기' }).click()
    await expect(page.locator('main').getByText('완료한 이야기 1 / 5')).toBeVisible()
    await page.getByRole('button', { name: '다시 연습하기' }).click()
    await expect(page.getByRole('heading', { name: '상황을 살펴봐요' })).toBeFocused()
    await page.getByRole('button', { name: '에피소드 목록으로 돌아가기' }).click()
    await expect(page.getByRole('button', { name: /내 차례인데 친구가 새치기를/ })).toContainText(
      '완료',
    )
  })
}

test('the story list asks before resuming a half-done story or replaying a finished one', async ({
  page,
}) => {
  await page.goto('/episode/D01/play')
  await next(page)
  await page.getByRole('radio', { name: '속상해요', exact: true }).click()
  await page.getByRole('button', { name: '에피소드 목록으로 돌아가기' }).click()
  const story = page.getByRole('button', { name: /내 차례인데 친구가 새치기를/ })
  await story.click()
  const dialog = page.getByRole('dialog', { name: '이어서 할까요?' })
  await expect(dialog).toBeVisible()
  await checkScreen(page)
  await dialog.getByRole('button', { name: '이어서 하기' }).click()
  await expect(
    page.getByRole('heading', { name: '이 상황에서 나는 어떤 기분이 들까요?' }),
  ).toBeVisible()
  await expect(page.getByRole('radio', { name: '속상해요', exact: true })).toHaveAttribute(
    'aria-checked',
    'true',
  )
  await page.getByRole('button', { name: '에피소드 목록으로 돌아가기' }).click()
  await story.click()
  await page.getByRole('button', { name: '처음부터 다시 하기' }).click()
  await expect(page.getByRole('heading', { name: '상황을 살펴봐요' })).toBeFocused()
  await page.evaluate(() =>
    localStorage.setItem(
      'maumlink.progress.mvp-v2',
      JSON.stringify({ state: { completedEpisodeIds: ['D01'] }, version: 0 }),
    ),
  )
  await page.goto('/area/D')
  await story.click()
  await expect(page.getByRole('dialog', { name: '다시 해볼까요?' })).toBeVisible()
  await page.getByRole('button', { name: '아니요' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(story).toBeFocused()
  await story.click()
  await page.getByRole('button', { name: '처음부터 다시 하기' }).click()
  await expect(page.getByRole('heading', { name: '상황을 살펴봐요' })).toBeFocused()
})

test('말로 이야기하기: hidden by default, records and shows the reply once an adult turns it on', async ({
  page,
}) => {
  await page.goto('/episode/B01/play')
  await next(page)
  // Default: off, so no microphone button even when the server has keys.
  await expect(page.getByRole('button', { name: '말로 이야기해 볼래요' })).toHaveCount(0)
  await page.route('**/api/voice/health', (route) =>
    route.fulfill({ json: { stt: true, ai: true, tts: false } }),
  )
  const turns: Array<{ audio: string; sampleRate: number; context: Record<string, unknown> }> = []
  await page.route('**/api/voice/turn', (route) => {
    turns.push(route.request().postDataJSON())
    return route.fulfill({
      json: {
        transcript: '친구가 안 불러서 속상했어요',
        reply: '그렇게 느낄 수 있어요. 보기에서 골라 볼까요?',
      },
    })
  })
  await page.evaluate(() => {
    const key = 'maumlink.settings.v1'
    const saved = JSON.parse(localStorage.getItem(key) ?? '{"state":{},"version":0}')
    saved.state.voiceInput = true
    localStorage.setItem(key, JSON.stringify(saved))
  })
  await page.reload()
  await page.getByRole('button', { name: '말로 이야기해 볼래요' }).click()
  await page.getByRole('button', { name: '말하기 시작' }).click()
  // The fake device can take a few seconds to open on a cold browser.
  await expect(page.locator('main').getByText(/듣고 있어요/)).toBeVisible({ timeout: 15_000 })
  await page.waitForTimeout(700)
  await page.getByRole('button', { name: '말하기 끝내기' }).click()
  await expect(page.locator('main').getByText('친구가 안 불러서 속상했어요')).toBeVisible()
  await expect(page.locator('main').getByText(/그렇게 느낄 수 있어요\. 보기에서/)).toBeVisible()
  await expect(page.getByRole('button', { name: '다시 말하기' })).toBeVisible()
  expect(turns).toHaveLength(1)
  // A real 16 kHz WAV went up (base64 of "RIFF"), with the screen's context for the reply.
  expect(turns[0]!.audio.startsWith('UklGR')).toBe(true)
  expect(turns[0]!.audio.length).toBeGreaterThan(10_000)
  expect(turns[0]!.sampleRate).toBe(16000)
  expect(turns[0]!.context).toMatchObject({
    story: '친구들과 함께 놀고 싶어요',
    prompt: '이 상황에서 나는 어떤 기분이 들까요?',
  })
  await checkScreen(page)
  // The voice panel never replaces the pick: the step still completes by choosing a card.
  await page.getByRole('radio').first().click()
  await expect(page.getByRole('button', { name: '다음' })).toBeVisible()
})

test('incompatible step save restarts silently; earlier completion stays', async ({ page }) => {
  await page.goto('/episode/D01/play')
  const old = await page.evaluate(() => {
    const key = 'maumlink.steps.mvp-v1.D01'
    const saved = JSON.parse(localStorage.getItem(key)!)
    saved.contentVersion = 0
    const raw = JSON.stringify(saved)
    localStorage.setItem(key, raw)
    localStorage.setItem(
      'maumlink.progress.mvp-v2',
      JSON.stringify({ state: { completedEpisodeIds: ['D01'] }, version: 0 }),
    )
    return raw
  })
  await page.reload()
  // No recovery notice: the story starts over and the stale save is replaced.
  await expect(page.getByRole('heading', { name: '상황을 살펴봐요' })).toBeFocused()
  expect(await page.evaluate(() => localStorage.getItem('maumlink.steps.mvp-v1.D01'))).not.toBe(old)
  await page.getByRole('button', { name: '에피소드 목록으로 돌아가기' }).click()
  await expect(page.getByRole('button', { name: /내 차례인데 친구가 새치기를/ })).toContainText(
    '완료',
  )
})

test('storage full: completion still renders with an honest warning', async ({ page }) => {
  await page.goto('/episode/D01/play')
  await next(page)
  await page.getByRole('radio', { name: '속상해요', exact: true }).click()
  await next(page)
  await page.getByRole('radio').first().click()
  await next(page)
  await page.getByRole('radio', { name: /도움 요청하기/ }).click()
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
  await expect(page.locator('main').getByText(/이 기기에 활동을 저장할 수 없어요/)).toBeVisible()
  await page.getByRole('button', { name: '마무리하기' }).click()
  await expect(
    page.getByRole('heading', { name: '잘했어요! 오늘도 새로운 방법을 배웠어요.' }),
  ).toBeVisible()
  await expect(page.locator('main').getByText(/완료 기록을 저장하지 못했어요/)).toBeVisible()
  await page.getByRole('button', { name: '다른 이야기 만나기' }).click()
  await expect(page.getByRole('heading', { name: '마음건강관리' })).toBeVisible()
})
