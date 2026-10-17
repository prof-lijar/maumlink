import { MemoryRouter, Route, Routes } from 'react-router'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { DomainEpisodes } from '@/screens/DomainEpisodes'
import { EpisodePlay } from '@/screens/EpisodePlay'
import { getStepEpisode } from '@/content/episodes'
import { initialStepGame, loadStepGame, saveStepGame, stepGameStatus } from '@/engine/stepGame'
import { useMvpProgress } from '@/services/mvpProgress'
import { useProfile } from '@/services/profile'
import { useSettings } from '@/services/settings'

const story = getStepEpisode('B01')!
const STORY = /친구들과 함께 놀고 싶어요/

beforeEach(() => {
  localStorage.clear()
  useSettings.setState({ started: true })
  useProfile.setState({ avatarId: 'haru' })
  useMvpProgress.setState({ completedEpisodeIds: [] })
})

function renderArea() {
  return render(
    <MemoryRouter initialEntries={['/area/B']}>
      <Routes>
        <Route path="/area/:domainId" element={<DomainEpisodes />} />
        <Route path="/episode/:episodeId/play" element={<EpisodePlay />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('story list asks before resuming or replaying', () => {
  it('opens a fresh story straight away', async () => {
    const user = userEvent.setup()
    renderArea()
    await user.click(screen.getByRole('button', { name: STORY }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '상황을 살펴봐요' })).toBeInTheDocument()
  })

  it('a half-done story: 이어서 하기 resumes where it was', async () => {
    saveStepGame(story, { ...initialStepGame(story), screen: 1 })
    expect(stepGameStatus(story)).toBe('in_progress')
    const user = userEvent.setup()
    renderArea()
    await user.click(screen.getByRole('button', { name: STORY }))
    const dialog = screen.getByRole('dialog', { name: '이어서 할까요?' })
    expect(dialog).toHaveTextContent('이 이야기는 아직 하는 중이에요.')
    expect(screen.getByRole('button', { name: '이어서 하기' })).toHaveFocus()
    await user.click(screen.getByRole('button', { name: '이어서 하기' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '이 상황에서 나는 어떤 기분이 들까요?' }),
    ).toBeInTheDocument()
  })

  it('a half-done story: 처음부터 다시 하기 clears the save', async () => {
    saveStepGame(story, { ...initialStepGame(story), screen: 1 })
    const user = userEvent.setup()
    renderArea()
    await user.click(screen.getByRole('button', { name: STORY }))
    await user.click(screen.getByRole('button', { name: '처음부터 다시 하기' }))
    expect(screen.getByRole('heading', { name: '상황을 살펴봐요' })).toBeInTheDocument()
    expect(loadStepGame(story)?.screen).toBe(0)
  })

  it('a finished story: 아니요 stays on the list, 처음부터 다시 하기 replays', async () => {
    useMvpProgress.setState({ completedEpisodeIds: ['B01'] })
    const user = userEvent.setup()
    renderArea()
    await user.click(screen.getByRole('button', { name: STORY }))
    expect(screen.getByRole('dialog', { name: '다시 해볼까요?' })).toHaveTextContent(
      '이 이야기는 이미 완료했어요.',
    )
    await user.click(screen.getByRole('button', { name: '아니요' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '관계 인식' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: STORY })).toHaveFocus()
    await user.click(screen.getByRole('button', { name: STORY }))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: STORY }))
    await user.click(screen.getByRole('button', { name: '처음부터 다시 하기' }))
    expect(screen.getByRole('heading', { name: '상황을 살펴봐요' })).toBeInTheDocument()
  })

  it('a save sitting on the completion screen counts as finished', () => {
    // E01 is reflect steps only, so a finished save is easy to write by hand.
    const finished = getStepEpisode('E01')!
    saveStepGame(finished, {
      screen: finished.steps.length + 1,
      steps: finished.steps.map((step) => ({
        kind: 'reflect' as const,
        selectedId: step.kind === 'reflect' ? step.options[0]!.id : null,
      })),
    })
    expect(stepGameStatus(finished)).toBe('finished')
    saveStepGame(finished, initialStepGame(finished))
    expect(stepGameStatus(finished)).toBe('fresh')
  })

  it('a save past a skipped mission is still valid (the story does not restart)', () => {
    // B01: reflect, reflect, choice, conversation (skippable), choice. Screen 5 = last choice.
    const game = initialStepGame(story)
    const steps = game.steps.map((state, index) => {
      if (state.kind === 'reflect') return { ...state, selectedId: 'angry' }
      if (state.kind === 'choice' && index === 2)
        return { ...state, selectedId: 'B', submittedId: 'B', solved: true }
      return state
    })
    saveStepGame(story, { ...game, screen: 5, steps })
    expect(stepGameStatus(story)).toBe('in_progress')
    expect(loadStepGame(story)?.screen).toBe(5)
  })
})
