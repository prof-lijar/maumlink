/**
 * 자기 인식 (Self-Awareness) — features requested by the domain design document:
 * situation card bubbles and emphasis, document step titles, the STEP 3 body-reaction
 * explorer ("X 버튼을 누르면 …") and STEP 4/5 coping exploration with a full recap.
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { validateAll } from '../../scripts/validate-core'
import { getScenario } from '@/content/loader'
import type { Scenario } from '@/content/schema'
import {
  canTryAnother,
  explorableFeelings,
  initialLessonState,
  reduce,
  triedActions,
  type LessonEvent,
} from '@/engine/lessonMachine'
import { loadSession, saveSession } from '@/engine/persistence'
import { useLesson } from '@/engine/store'
import { Lesson } from '@/screens/lesson/Lesson'
import { useProgress } from '@/services/progress'
import { useSettings } from '@/services/settings'
import { validEmotions, validScenario, validUi } from '../fixtures/content'

const self = getScenario('self-presentation-teasing')!
const run = (events: LessonEvent[], sc: Scenario = self) =>
  events.reduce((s, e) => reduce(s, e, sc), initialLessonState(sc.id))
const toStep3 = (feeling: string): LessonEvent[] => [
  { type: 'NEXT' },
  { type: 'NEXT' },
  { type: 'SELECT_FEELING', id: feeling },
  { type: 'NEXT' },
]

describe('자기 인식 content wiring', () => {
  it('uses the document step titles and explore modes', () => {
    expect(self.stepTitles?.step3?.ko).toBe('그 때 나의 몸의 반응은?')
    expect(self.stepTitles?.action?.ko).toBe('나를 도와주는 방법')
    expect(self.step3.type === 'body-reaction' && self.step3.explore).toBe(true)
    expect(self.action.explore).toBe(true)
    expect(explorableFeelings(self)).toEqual(['angry', 'nervous', 'upset', 'worried'])
  })
})

describe('STEP 3 body-reaction explorer (engine)', () => {
  it('opens on the child’s own feeling when the document describes it', () => {
    const s = run(toStep3('upset'))
    expect(s.step).toBe('step3')
    expect(s.exploredFeelingId).toBe('upset')
    expect(s.exploredFeelingIds).toEqual(['upset'])
  })
  it('opens with nothing shown for a feeling without a documented reaction', () => {
    const s = run(toStep3('shy'))
    expect(s.exploredFeelingId).toBeUndefined()
    expect(s.exploredFeelingIds).toEqual([])
  })
  it('records each pressed feeling once and ignores undocumented ones', () => {
    const s = run([
      ...toStep3('shy'),
      { type: 'EXPLORE_FEELING', id: 'angry' },
      { type: 'EXPLORE_FEELING', id: 'worried' },
      { type: 'EXPLORE_FEELING', id: 'angry' },
      { type: 'EXPLORE_FEELING', id: 'scared' },
    ])
    expect(s.exploredFeelingId).toBe('angry')
    expect(s.exploredFeelingIds).toEqual(['angry', 'worried'])
  })
  it('is inert for lessons that do not opt in', () => {
    const plain = validScenario()
    const s = reduce(
      run([{ type: 'NEXT' }, { type: 'NEXT' }, { type: 'NEXT' }], plain),
      { type: 'EXPLORE_FEELING', id: 'angry' },
      plain,
    )
    expect(s.exploredFeelingId).toBeUndefined()
  })
})

describe('STEP 4/5 coping exploration (engine)', () => {
  const choose = (id: 'A' | 'B' | 'C' | 'D'): LessonEvent[] => [
    { type: 'SELECT_ACTION', id },
    { type: 'CHOOSE' },
  ]
  it('lets the child try every method in turn, then stops offering', () => {
    let s = run([...toStep3('upset'), { type: 'GOT_IT' }, ...choose('D')])
    for (const next of ['A', 'B', 'C'] as const) {
      expect(canTryAnother(s, self)).toBe(true)
      s = reduce(s, { type: 'TRY_ANOTHER' }, self)
      expect(s.step).toBe('action')
      s = [...choose(next)].reduce((x, e) => reduce(x, e, self), s)
    }
    expect(canTryAnother(s, self)).toBe(false)
    expect(triedActions(s, self).map((a) => a.id)).toEqual(['D', 'A', 'B', 'C'])
  })
  it('keeps reconsider-only retry for lessons without explore', () => {
    const plain = validScenario()
    const s = run(
      [
        { type: 'NEXT' },
        { type: 'NEXT' },
        { type: 'NEXT' },
        { type: 'SELECT_FEELING', id: 'angry' },
        { type: 'NEXT' },
        { type: 'GOT_IT' },
        { type: 'SELECT_ACTION', id: 'C' },
        { type: 'CHOOSE' },
      ],
      plain,
    )
    expect(canTryAnother(s, plain)).toBe(false)
  })
})

describe('session restore', () => {
  it('restores explored feelings and rejects ones the document does not describe', () => {
    const s = run([...toStep3('upset'), { type: 'EXPLORE_FEELING', id: 'angry' }])
    saveSession(s)
    expect(loadSession(self)?.exploredFeelingIds).toEqual(['upset', 'angry'])
    saveSession({ ...s, exploredFeelingIds: ['shy'] })
    expect(loadSession(self)).toBeUndefined()
  })
})

describe('validator rules for the new fields', () => {
  let root: string
  const write = (rel: string, data: unknown) => {
    const p = join(root, rel)
    mkdirSync(join(p, '..'), { recursive: true })
    writeFileSync(p, JSON.stringify(data))
  }
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'maumlink-self-'))
    write('content/emotions.json', validEmotions)
    write('content/ui.json', validUi)
    for (const icon of ['think', 'wait', 'talk', 'teacher'])
      write(`public/icons/outcome/${icon}.svg`, '')
    write('public/img/test.png', '')
    return () => rmSync(root, { recursive: true, force: true })
  })
  it('rejects an emphasised word that is not in the story', () => {
    const s = validScenario()
    s.situation.emphasis = [{ ko: '없는 말' }]
    write('content/scenarios/test-scenario.json', s)
    expect(validateAll(root).errors.some((e) => e.path === 'situation.emphasis.0')).toBe(true)
  })
  it('rejects body-reaction explore with fewer than two documented reactions', () => {
    const s = validScenario()
    s.step3 = {
      type: 'body-reaction',
      explore: true,
      question: { ko: '몸은?' },
      byFeeling: { angry: { text: { ko: '뜨거워요' }, parts: ['head'] } },
      sourceOmissions: ['upset'],
    }
    write('content/scenarios/test-scenario.json', s)
    expect(validateAll(root).errors.some((e) => e.path === 'step3.explore')).toBe(true)
  })
})

describe('자기 인식 lesson (screens)', () => {
  beforeEach(() => {
    useSettings.setState({ started: true, autoRead: false, sound: false, locale: 'ko' })
    useProgress.setState({ entries: {} })
    useLesson.getState().reset()
  })

  it('shows the document card, explorer and every tried coping method', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={[`/lesson/${self.id}`]}>
        <Routes>
          <Route path="/" element={<p>home</p>} />
          <Route path="/lesson/:scenarioId" element={<Lesson />} />
          <Route path="/lesson/:scenarioId/done" element={<Lesson />} />
        </Routes>
      </MemoryRouter>,
    )

    // STEP 1 — scene bubbles from the document's situation card and the red word.
    const bubbles = screen.getByRole('list', { name: '친구들이 내 발표를 듣고 놀려요.' })
    expect(
      within(bubbles)
        .getAllByRole('listitem')
        .map((li) => li.textContent),
    ).toEqual(['ㅋㅋㅋ', '발표 진짜 못하나~', '그건 뭐야~?'])
    expect(screen.getByTestId('story-card').querySelector('strong')?.textContent).toBe('속상해')
    expect(screen.getByText('상황 보기')).toBeInTheDocument()
    await user.click(screen.getByTestId('nav-primary'))
    await user.click(screen.getByTestId('nav-primary'))

    // STEP 2 → STEP 3 with the document title in the progress caption.
    await user.click(screen.getByRole('checkbox', { name: '속상해요' }))
    await user.click(screen.getByTestId('nav-primary'))
    expect(screen.getByText('그 때 나의 몸의 반응은?')).toBeInTheDocument()
    const card = screen.getByTestId('body-reaction-card')
    expect(card).toHaveTextContent('눈물이 나온다, 고개가 숙여진다, 몸에 힘이 빠진다.')
    const explorer = screen.getByTestId('body-explorer')
    await user.click(within(explorer).getByRole('button', { name: '화가 나요' }))
    expect(screen.getByTestId('body-reaction-card')).toHaveTextContent(
      '머리에 열이 오르고 눈이 뜨거워지고, 목소리가 커진다.',
    )
    expect(within(explorer).getByRole('button', { name: '화가 나요' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await user.click(screen.getByTestId('nav-primary'))

    // STEP 4/5 — try one method, then another; both appear in the recap.
    expect(screen.getByText('나를 도와주는 방법')).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: /숨을 크게 내쉬어보기/ }))
    await user.click(screen.getByTestId('nav-primary'))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('선택에 따른 피드백')
    await user.click(screen.getByTestId('nav-try-another'))
    await user.click(screen.getByRole('radio', { name: /마음을 위로하기 위해 그림을 그려보기/ }))
    await user.click(screen.getByTestId('nav-primary'))
    await user.click(screen.getByTestId('nav-primary'))

    const recap = screen.getByTestId('journey-actions')
    expect(
      within(recap)
        .getAllByRole('listitem')
        .map((li) => li.querySelector('span:last-child')?.textContent),
    ).toEqual(['숨을 크게 내쉬어보기', '마음을 위로하기 위해 그림을 그려보기'])
  })
})
