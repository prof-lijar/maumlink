/**
 * 관계 인식 (Social Awareness) — features requested by the domain design document:
 * document step titles, the inserted playground picture, the STEP 3 principle
 * (acknowledge the chosen reason, then show that the same situation gives people different
 * feelings and thoughts) and STEP 4 action comparison with a recap of the ways worth keeping.
 */
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { getScenario } from '@/content/loader'
import {
  explorableFeelings,
  initialLessonState,
  reduce,
  type LessonEvent,
} from '@/engine/lessonMachine'
import { useLesson } from '@/engine/store'
import { Lesson } from '@/screens/lesson/Lesson'
import { useProgress } from '@/services/progress'
import { useSettings } from '@/services/settings'

const social = getScenario('social-playground')!
const run = (events: LessonEvent[]) =>
  events.reduce((s, e) => reduce(s, e, social), initialLessonState(social.id))
const toStep3 = (feeling: string): LessonEvent[] => [
  { type: 'NEXT' },
  { type: 'NEXT' },
  { type: 'NEXT' },
  { type: 'SELECT_FEELING', id: feeling },
  { type: 'NEXT' },
]

describe('관계 인식 content wiring', () => {
  it('uses the document titles, its own picture and both explore modes', () => {
    expect(social.stepTitles?.step3?.ko).toBe('왜 그런 기분이 들까요?')
    expect(social.stepTitles?.action?.ko).toBe('어떻게 하면 좋을까요?')
    expect(social.situation.image).toBe('/img/v3/scene-social-playground.png')
    expect(social.step3.type === 'reason' && social.step3.explore).toBe(true)
    expect(social.action.explore).toBe(true)
    expect(explorableFeelings(social)).toEqual(['annoyed', 'angry', 'embarrassed', 'worried'])
  })
  it('keeps the document’s quote spacing exactly', () => {
    expect(social.action.options[0]!.text.ko).toBe(
      '친구들에게 화를 내며 “왜 나만 빼도 놀아!＂라고 말해요.',
    )
    expect(social.action.options[2]!.text.ko).toBe(
      '친구들에게 “나도 같이 놀아도 돼?”라고 물어봐요.',
    )
  })
})

describe('STEP 3 reason comparison (engine)', () => {
  it('acknowledges the child’s own documented reason first', () => {
    expect(run(toStep3('annoyed')).exploredFeelingIds).toEqual(['annoyed'])
  })
  it('starts with nothing opened for 서운해요, which the document gives no reason for', () => {
    expect(run(toStep3('hurt')).exploredFeelingIds).toEqual([])
  })
})

describe('관계 인식 lesson (screens)', () => {
  beforeEach(() => {
    useSettings.setState({ started: true, autoRead: false, sound: false, locale: 'ko' })
    useProgress.setState({ entries: {} })
    useLesson.getState().reset()
  })

  const renderLesson = () =>
    render(
      <MemoryRouter initialEntries={[`/lesson/${social.id}`]}>
        <Routes>
          <Route path="/lesson/:scenarioId" element={<Lesson />} />
          <Route path="/lesson/:scenarioId/done" element={<Lesson />} />
        </Routes>
      </MemoryRouter>,
    )

  it('shows my reason, lets me open other feelings’ reasons, and recaps the ways to keep', async () => {
    const user = userEvent.setup()
    renderLesson()
    for (let i = 0; i < 3; i++) await user.click(screen.getByTestId('nav-primary'))
    await user.click(screen.getByRole('checkbox', { name: '짜증나요' }))
    await user.click(screen.getByTestId('nav-primary'))

    expect(screen.getByText('왜 그런 기분이 들까요?')).toBeInTheDocument()
    expect(screen.getByTestId('own-reason')).toHaveTextContent(
      '친구들이 나와 놀기 싫어한다고 생각해서',
    )
    // The comparison is introduced by the lesson's own title — its core value.
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      '나와 너의 생각이 다를 수 있어!',
    )
    const others = screen.getByTestId('reason-compare')
    expect(
      within(others)
        .getAllByRole('button')
        .map((b) => b.dataset.emotion),
    ).toEqual(['angry', 'embarrassed', 'worried'])
    expect(others).not.toHaveTextContent('친구들이 거절할까 봐 걱정돼서')
    const worried = within(others).getByRole('button', { name: /걱정돼요/ })
    await user.click(worried)
    expect(worried).toHaveAttribute('aria-expanded', 'true')
    expect(worried).toHaveTextContent('친구들이 거절할까 봐 걱정돼서')
    await user.click(screen.getByTestId('nav-primary'))

    // STEP 4/5 — compare: try the angry way, then asking; recap keeps the respectful one.
    await user.click(screen.getByRole('radio', { name: /화를 내며/ }))
    await user.click(screen.getByTestId('nav-primary'))
    await user.click(screen.getByTestId('nav-try-another'))
    await user.click(screen.getByRole('radio', { name: /나도 같이 놀아도 돼/ }))
    await user.click(screen.getByTestId('nav-primary'))
    expect(screen.getByTestId('nav-try-another')).toBeInTheDocument()
    await user.click(screen.getByTestId('nav-primary'))
    expect(screen.getByTestId('journey-actions')).toHaveTextContent(
      '친구들에게 “나도 같이 놀아도 돼?”라고 물어봐요.',
    )
    expect(screen.getByTestId('journey-actions')).not.toHaveTextContent('화를 내며')
  })

  it('for 서운해요 shows every documented reason to compare, without inventing one', async () => {
    const user = userEvent.setup()
    renderLesson()
    for (let i = 0; i < 3; i++) await user.click(screen.getByTestId('nav-primary'))
    await user.click(screen.getByRole('checkbox', { name: '서운해요' }))
    await user.click(screen.getByTestId('nav-primary'))
    expect(screen.queryByTestId('own-reason')).not.toBeInTheDocument()
    expect(within(screen.getByTestId('reason-compare')).getAllByRole('button')).toHaveLength(4)
  })
})
