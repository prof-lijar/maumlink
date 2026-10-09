/**
 * 마음건강관리 (Mental Health Care) — features requested by the domain design document:
 * document step titles, exact md wording, the STEP 3 principle (acknowledge my reason, then
 * other feelings' reasons in the same situation) and exploring every way to express myself or
 * ask for help in STEP 4/5.
 */
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { getScenario } from '@/content/loader'
import { explorableFeelings } from '@/engine/lessonMachine'
import { useLesson } from '@/engine/store'
import { Lesson } from '@/screens/lesson/Lesson'
import { useProgress } from '@/services/progress'
import { useSettings } from '@/services/settings'

const mind = getScenario('mind-lunch-line')!

describe('마음건강관리 content wiring', () => {
  it('uses the document titles and both explore modes, with no invented heading', () => {
    expect(mind.stepTitles?.step3?.ko).toBe('왜 그런 기분이 들까요?')
    expect(mind.stepTitles?.action?.ko).toBe('어떻게 하면 좋을까요?')
    expect(mind.step3.type === 'reason' && mind.step3.explore).toBe(true)
    expect(mind.step3.type === 'reason' && mind.step3.compareHeading).toBeUndefined()
    expect(mind.action.explore).toBe(true)
    // 잘 모르겠어요 has no reason, so it is never offered for comparison.
    expect(explorableFeelings(mind)).toEqual(['upset', 'frustrated', 'unfair', 'sorry'])
  })
  it('keeps the document’s quote spacing exactly', () => {
    expect(mind.action.options[0]!.text.ko).toBe(
      '내 마음 말하기 – “ 네가 새치기해서 나는 속상했어＂라고 말하기',
    )
    expect(mind.action.options[3]!.text.ko).toBe(
      '도움 요청하기 – 선생님에게 “ 친구와 해결하기 어려워요. 도와주세요＂',
    )
  })
})

describe('마음건강관리 lesson (screens)', () => {
  beforeEach(() => {
    useSettings.setState({ started: true, autoRead: false, sound: false, locale: 'ko' })
    useProgress.setState({ entries: {} })
    useLesson.getState().reset()
  })

  it('compares reasons, then lets me try ways to express and ask for help', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={[`/lesson/${mind.id}`]}>
        <Routes>
          <Route path="/lesson/:scenarioId" element={<Lesson />} />
          <Route path="/lesson/:scenarioId/done" element={<Lesson />} />
        </Routes>
      </MemoryRouter>,
    )
    for (let i = 0; i < 4; i++) await user.click(screen.getByTestId('nav-primary'))
    await user.click(screen.getByRole('checkbox', { name: '답답해요' }))
    await user.click(screen.getByTestId('nav-primary'))

    expect(screen.getByTestId('own-reason')).toHaveTextContent(
      '친구에게 뭐라고 이야기하고 싶은데 말이 잘 안나와서',
    )
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument()
    const others = screen.getByTestId('reason-compare')
    const sorry = within(others).getByRole('button', { name: /미안해요/ })
    await user.click(sorry)
    expect(sorry).toHaveTextContent('뒤에 서 있는 친구들에게 미안한 마음이 들어서')
    await user.click(screen.getByTestId('nav-primary'))

    await user.click(screen.getByRole('radio', { name: /내 마음 말하기/ }))
    await user.click(screen.getByTestId('nav-primary'))
    await user.click(screen.getByTestId('nav-try-another'))
    await user.click(screen.getByRole('radio', { name: /도움 요청하기/ }))
    await user.click(screen.getByTestId('nav-primary'))
    expect(screen.getByTestId('feedback-card')).toHaveTextContent('선생님께 도움을 요청했군요.')
    await user.click(screen.getByTestId('nav-primary'))
    const recap = within(screen.getByTestId('journey-actions')).getAllByRole('listitem')
    expect(recap.map((li) => li.querySelector('span:last-child')?.textContent)).toEqual([
      mind.action.options[0]!.text.ko,
      mind.action.options[3]!.text.ko,
    ])
  })
})
