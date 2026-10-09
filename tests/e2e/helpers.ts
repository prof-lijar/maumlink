import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { expect, type Page } from '@playwright/test'
import type { OptionId, Scenario } from '../../src/content/schema'

const root = fileURLToPath(new URL('../..', import.meta.url))

export function loadScenarios(): Scenario[] {
  const dir = join(root, 'content', 'scenarios')
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as Scenario)
}

export interface Prefs {
  textSize?: 'normal' | 'large'
  started?: boolean
  sound?: boolean
  autoRead?: boolean
  avatar?: 'haru' | 'sora' | 'mina' | 'jun'
}

/** Seed persisted settings before the app boots (skips the Start gate unless started=false). */
export async function seedSettings(page: Page, prefs: Prefs = {}) {
  const state = {
    textSize: 'normal',
    sound: false,
    autoRead: false,
    started: true,
    avatar: 'haru',
    ...prefs,
  }
  await page.addInitScript((s) => {
    // Seed once; later navigations/reloads must keep whatever the app persisted.
    if (!window.localStorage.getItem('maumlink.settings.v1'))
      window.localStorage.setItem('maumlink.settings.v1', JSON.stringify({ state: s, version: 0 }))
  }, state)
}

export async function gotoHome(page: Page) {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
}

export async function openScenario(page: Page, scenario: Scenario) {
  await page.locator(`[data-domain="${scenario.domain}"]`).click()
  // Domains with several scenarios show a picker sheet.
  const picker = page.getByRole('dialog')
  if (await picker.isVisible().catch(() => false)) {
    await picker.getByRole('button', { name: scenario.title.ko }).click()
  }
  await page.waitForURL(new RegExp(`/lesson/${scenario.id}(?:\\?|$)`))
  await expect(page.getByTestId('story-card')).toBeVisible()
}

const primary = (page: Page) => page.getByTestId('nav-primary')

export function pickAction(
  scenario: Scenario,
  quality: 'recommended' | 'reconsider' = 'recommended',
): OptionId {
  const o =
    scenario.action.options.find((x) => x.quality === quality) ?? scenario.action.options[2]!
  return o.id
}

/**
 * Drives a lesson from the situation screen to wrap-up along one path.
 * `onScreen` runs on every screen (used for FR-RES assertions and screenshots).
 */
export async function playLesson(
  page: Page,
  scenario: Scenario,
  opts: {
    action?: OptionId
    feeling?: string
    onScreen?: (screen: string) => Promise<void>
    tellMore?: boolean
  } = {},
) {
  const on = async (s: string) => opts.onScreen?.(s)
  const feeling = opts.feeling ?? scenario.feeling.options[0]!
  const action = opts.action ?? pickAction(scenario)

  // S1: one sentence per tap, then the key sentence.
  await on('situation')
  for (let i = 0; i < scenario.situation.story.length; i++) await primary(page).click()
  await expect(page.getByTestId('story-card')).toContainText(
    scenario.situation.keySentence.ko.slice(0, 6),
  )
  await on('situation-key')
  await primary(page).click()

  // S2
  await expect(page.locator(`[data-emotion="${feeling}"]`)).toBeVisible()
  await on('feeling')
  await page.locator(`[data-emotion="${feeling}"]`).click()
  await expect(page.locator(`[data-emotion="${feeling}"]`)).toHaveAttribute('aria-checked', 'true')
  await primary(page).click()

  // S3
  if (scenario.step3.type === 'multiple-choice') {
    await page.locator('[data-option="A"]').click()
  } else {
    const text =
      scenario.step3.type === 'reason'
        ? scenario.step3.byFeeling[feeling]
        : scenario.step3.byFeeling[feeling]?.text
    if (text) await expect(page.getByRole('main')).toContainText(text.ko.slice(0, 8))
  }
  await on('step3')
  if (opts.tellMore && scenario.step3.more) {
    await page.getByTestId('nav-more').click()
    await expect(page.getByTestId('step3-more')).toContainText(scenario.step3.more.ko.slice(0, 8))
  }
  await primary(page).click()

  // S4
  await expect(page.locator('[data-option="A"]')).toBeVisible()
  await on('action')
  await page.locator(`[data-option="${action}"]`).click()
  await primary(page).click()

  // S5
  const chosen = scenario.action.options.find((o) => o.id === action)!
  await expect(page.getByTestId('feedback-card')).toContainText(chosen.feedback.ko.slice(0, 10))
  await on('feedback')
  await primary(page).click()

  // S6
  await expect(page.getByTestId('closing-card')).toContainText(scenario.closing.ko.slice(0, 10))
  await on('wrapup')
}

/** After a viewport change, wait until the shell has re-laid out to the new dvh (Chromium updates it asynchronously). */
export async function settleViewport(page: Page) {
  await page.waitForFunction(() => {
    const shell = document.querySelector<HTMLElement>('#root > div')
    return !shell || Math.round(shell.getBoundingClientRect().height) <= window.innerHeight + 1
  })
}

/* ------------------------------------------------------------------ FR-RES checks */

interface Box {
  x: number
  y: number
  w: number
  h: number
  label: string
}

/** FR-RES-01: no horizontal overflow on the document or the lesson content zone. */
export async function assertNoHorizontalOverflow(page: Page, label: string) {
  const r = await page.evaluate(() => {
    const d = document.documentElement
    const main = document.querySelector('main')
    return {
      doc: [d.scrollWidth, d.clientWidth],
      main: main ? [main.scrollWidth, main.clientWidth] : [0, 0],
    }
  })
  expect(r.doc[0], `${label}: document scrollWidth > clientWidth`).toBeLessThanOrEqual(
    r.doc[1]! + 1,
  )
  expect(r.main[0], `${label}: main scrollWidth > clientWidth`).toBeLessThanOrEqual(r.main[1]! + 1)
}

/**
 * FR-RES-02: every visible interactive element ≥ 64×64 and no two overlap.
 * Boxes are clipped to their scroll-container ancestors (content scrolled under the
 * fixed bars is not visible), and when a modal dialog is open only its controls count.
 */
export async function assertTapTargets(page: Page, label: string) {
  const boxes: Box[] = await page.evaluate(() => {
    const dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]')
    const scope: ParentNode = dialog ?? document
    const els = Array.from(
      scope.querySelectorAll<HTMLElement>(
        'button, a[href], [role="button"], [role="radio"], [role="checkbox"]',
      ),
    )
    const out: {
      x: number
      y: number
      w: number
      h: number
      label: string
      fullW: number
      fullH: number
    }[] = []
    for (const el of els) {
      const cs = getComputedStyle(el)
      if (cs.display === 'none' || cs.visibility === 'hidden') continue
      const full = el.getBoundingClientRect()
      if (full.width === 0 || full.height === 0) continue
      // Clip to every ancestor that clips overflow, then to the viewport.
      let x1 = full.left
      let y1 = full.top
      let x2 = full.right
      let y2 = full.bottom
      for (let a = el.parentElement; a; a = a.parentElement) {
        const acs = getComputedStyle(a)
        if (acs.overflowY !== 'visible' || acs.overflowX !== 'visible') {
          const r = a.getBoundingClientRect()
          x1 = Math.max(x1, r.left)
          y1 = Math.max(y1, r.top)
          x2 = Math.min(x2, r.right)
          y2 = Math.min(y2, r.bottom)
        }
      }
      x1 = Math.max(x1, 0)
      y1 = Math.max(y1, 0)
      x2 = Math.min(x2, window.innerWidth)
      y2 = Math.min(y2, window.innerHeight)
      if (x2 - x1 <= 1 || y2 - y1 <= 1) continue // not visible right now (scrolled away)
      out.push({
        x: x1,
        y: y1,
        w: x2 - x1,
        h: y2 - y1,
        fullW: full.width,
        fullH: full.height,
        label: (
          el.getAttribute('aria-label') ||
          el.textContent ||
          el.getAttribute('data-testid') ||
          el.tagName
        )
          .trim()
          .slice(0, 30),
      })
    }
    return out
  })
  for (const b of boxes as (Box & { fullW: number; fullH: number })[]) {
    // Size is judged on the element's own box (a partially scrolled target is still 64 px tall).
    expect(
      b.fullW,
      `${label}: "${b.label}" width ${b.fullW.toFixed(0)} < 64`,
    ).toBeGreaterThanOrEqual(63.5)
    expect(
      b.fullH,
      `${label}: "${b.label}" height ${b.fullH.toFixed(0)} < 64`,
    ).toBeGreaterThanOrEqual(63.5)
  }
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i]!
      const b = boxes[j]!
      const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
      const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)
      const overlap = ox > 2 && oy > 2
      expect(overlap, `${label}: "${a.label}" overlaps "${b.label}"`).toBe(false)
    }
  }
}

/** FR-RES-03: primary + back buttons fully inside the viewport without scrolling. */
export async function assertNavVisible(page: Page, label: string) {
  const vp = page.viewportSize()!
  for (const id of ['nav-primary', 'nav-back']) {
    const loc = page.getByTestId(id)
    if ((await loc.count()) === 0) continue
    const box = await loc.boundingBox()
    expect(box, `${label}: ${id} has no box`).not.toBeNull()
    expect(box!.y + box!.height, `${label}: ${id} below viewport`).toBeLessThanOrEqual(
      vp.height + 1,
    )
    expect(box!.x + box!.width, `${label}: ${id} right of viewport`).toBeLessThanOrEqual(
      vp.width + 1,
    )
    expect(box!.y, `${label}: ${id} above viewport`).toBeGreaterThanOrEqual(-1)
    expect(box!.x, `${label}: ${id} left of viewport`).toBeGreaterThanOrEqual(-1)
  }
}

/** FR-RES-04: no ellipsis truncation and no text box clipping its own content horizontally. */
export async function assertNoClippedText(page: Page, label: string) {
  const clipped: string[] = await page.evaluate(() => {
    const bad: string[] = []
    const els: HTMLElement[] = Array.from(
      document.querySelectorAll<HTMLElement>('p, h1, h2, span, button'),
    )
    for (const el of els) {
      const cs = getComputedStyle(el)
      // Screen-reader-only text (1×1 px, clip rect) is intentionally hidden, not clipped content.
      const r = el.getBoundingClientRect()
      if (r.width <= 1 || r.height <= 1 || cs.clipPath !== 'none' || cs.clip !== 'auto') continue
      if (cs.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1)
        bad.push(`ellipsis: ${el.textContent?.slice(0, 30)}`)
      if (
        cs.overflowX === 'hidden' &&
        cs.whiteSpace === 'nowrap' &&
        el.scrollWidth > el.clientWidth + 1
      )
        bad.push(`nowrap-clip: ${el.textContent?.slice(0, 30)}`)
    }
    return bad
  })
  expect(clipped, `${label}: clipped text`).toEqual([])
}

export async function assertResponsive(page: Page, label: string) {
  await assertNoHorizontalOverflow(page, label)
  await assertTapTargets(page, label)
  await assertNavVisible(page, label)
  await assertNoClippedText(page, label)
}
