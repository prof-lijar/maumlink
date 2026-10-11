import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, expect, it } from 'vitest'
import { scenarios, getEmotion } from '@/content/loader'
import { useLesson } from '@/engine/store'
import { Lesson } from '@/screens/lesson/Lesson'
import { useSettings } from '@/services/settings'
import { useProgress } from '@/services/progress'

beforeEach(() => {
  useSettings.setState({ started: true, autoRead: false, sound: false, locale: 'ko' })
  useProgress.setState({ entries: {} })
  useLesson.getState().reset()
})

it.each(scenarios)(
  '$id: archived lesson engine still renders its saved content',
  async (scenario) => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={[`/lesson/${scenario.id}`]}>
        <Routes>
          <Route path="/lesson/:scenarioId" element={<Lesson />} />
          <Route path="/lesson/:scenarioId/done" element={<Lesson />} />
        </Routes>
      </MemoryRouter>,
    )
    for (const sentence of scenario.situation.story) {
      expect(screen.getByTestId('story-card').textContent).toBe(sentence.ko)
      expect(screen.getAllByTestId('story-card')).toHaveLength(1)
      await user.click(screen.getByTestId('nav-primary'))
    }
    expect(screen.getByTestId('story-card').textContent).toBe(scenario.situation.keySentence.ko)
    await user.click(screen.getByTestId('nav-primary'))

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      scenario.feeling.question.ko,
    )
    expect(screen.getByRole('img', { name: scenario.situation.imageBrief.ko })).toBeInTheDocument()
    const feeling = getEmotion(scenario.feeling.options[0]!)
    await user.click(screen.getByRole('checkbox', { name: feeling.word.ko }))
    await user.click(screen.getByTestId('nav-primary'))
    if (scenario.step3.type === 'multiple-choice')
      await user.click(screen.getAllByRole('radio')[0]!)
    if (scenario.step3.more) {
      await user.click(screen.getByTestId('nav-more'))
      expect(screen.getByTestId('step3-more')).toHaveTextContent(scenario.step3.more.ko)
    } else {
      expect(screen.queryByTestId('nav-more')).not.toBeInTheDocument()
    }
    await user.click(screen.getByTestId('nav-primary'))

    const action = scenario.action.options[2]!
    await user.click(screen.getByRole('radio', { name: action.text.ko }))
    await user.click(screen.getByTestId('nav-primary'))
    expect(screen.getByTestId('feedback-card')).toHaveTextContent(action.feedback.ko)
    await user.click(screen.getByTestId('nav-primary'))

    const recap = screen.getByRole('region', { name: '오늘의 길' })
    expect(within(recap).getByText(feeling.word.ko)).toBeInTheDocument()
    expect(within(recap).getByText(action.text.ko)).toBeInTheDocument()
    expect(screen.getByTestId('closing-card')).toHaveTextContent(scenario.closing.ko)
    expect(useProgress.getState().isCompleted(scenario.id)).toBe(true)
  },
)

for (const scenario of scenarios) {
  if (scenario.step3.type === 'multiple-choice') continue
  for (const id of scenario.step3.sourceOmissions ?? []) {
    it(`${scenario.id}/${id}: source gap keeps the original question and allows continuing`, async () => {
      const user = userEvent.setup()
      render(
        <MemoryRouter initialEntries={[`/lesson/${scenario.id}`]}>
          <Routes>
            <Route path="/lesson/:scenarioId" element={<Lesson />} />
          </Routes>
        </MemoryRouter>,
      )
      for (let i = 0; i <= scenario.situation.story.length; i++)
        await user.click(screen.getByTestId('nav-primary'))
      await user.click(screen.getByRole('checkbox', { name: getEmotion(id).word.ko }))
      await user.click(screen.getByTestId('nav-primary'))
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        scenario.step3.question.ko,
      )
      expect(screen.queryByTestId('nav-more')).not.toBeInTheDocument()
      await user.click(screen.getByTestId('nav-primary'))
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        scenario.action.question.ko,
      )
    })
  }
}
