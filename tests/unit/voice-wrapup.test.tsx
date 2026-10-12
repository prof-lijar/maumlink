import { MemoryRouter, Route, Routes } from 'react-router'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getStepEpisode } from '@/content/episodes'
import { saveStepGame, spokenTurns } from '@/engine/stepGame'
import { EpisodePlay } from '@/screens/EpisodePlay'
import { useProfile } from '@/services/profile'
import { useSettings } from '@/services/settings'

const requestWrapup = vi.fn(async (_input: unknown) => ({
  text: "오늘 '잘 모르겠어요'라고 말해 주었어요. 솔직하게 말한 것이 멋져요. 하고 싶은 말이 생기면 잠깐 멈춰요. 그리고 내가 할 수 있는 방법을 선택해 보아요!",
}))
vi.mock('@/voice/voiceApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/voice/voiceApi')>()),
  requestWrapup: (input: unknown) => requestWrapup(input),
}))

// E01 is reflect steps only, so a finished game is easy to write by hand.
const episode = getStepEpisode('E01')!
const finished = (spoken?: string) => ({
  screen: episode.steps.length + 1,
  steps: episode.steps.map((step, i) => ({
    kind: 'reflect' as const,
    selectedId: step.kind === 'reflect' ? step.options[0]!.id : null,
    ...(spoken && i === 0 ? { spoken } : {}),
  })),
})

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  useSettings.setState({ started: true, voiceInput: true, voiceEnabled: false, autoRead: false })
  useProfile.setState({ avatarId: 'haru' })
})

const renderPlay = () =>
  render(
    <MemoryRouter initialEntries={['/episode/E01/play']}>
      <Routes>
        <Route path="/episode/:episodeId/play" element={<EpisodePlay />} />
      </Routes>
    </MemoryRouter>,
  )

describe('마무리 with and without voice input', () => {
  it('shows the fixed takeaway and asks nothing when the child never spoke', () => {
    saveStepGame(episode, finished())
    renderPlay()
    expect(screen.getByText(episode.takeaway)).toBeInTheDocument()
    expect(screen.getByText('마무리', { selector: '.garden-chip' })).toBeInTheDocument()
    expect(requestWrapup).not.toHaveBeenCalled()
  })

  it('writes a personal wrap-up from what was said, ending with the reviewed takeaway, and keeps it', async () => {
    saveStepGame(episode, finished('잘 모르겠어요'))
    const first = episode.steps[0]!
    expect(spokenTurns(episode, finished('잘 모르겠어요'))).toEqual([
      { prompt: first.kind === 'reflect' ? first.prompt : undefined, said: '잘 모르겠어요' },
    ])
    const { unmount } = renderPlay()
    expect(screen.getByRole('status')).toHaveTextContent('마무리 인사를 만들고 있어요')
    expect(await screen.findByText(/오늘 '잘 모르겠어요'라고 말해 주었어요/)).toBeInTheDocument()
    expect(screen.getByText(/하고 싶은 말이 생기면 잠깐 멈춰요/)).toBeInTheDocument()
    expect(screen.getByText('오늘 내가 한 말')).toBeInTheDocument()
    expect(requestWrapup).toHaveBeenCalledTimes(1)
    expect(requestWrapup.mock.calls[0]?.[0]).toMatchObject({
      story: episode.title,
      takeaway: episode.takeaway,
      turns: [{ said: '잘 모르겠어요' }],
    })
    // Coming back later shows the saved wrap-up without asking again.
    unmount()
    renderPlay()
    expect(screen.getByText(/오늘 '잘 모르겠어요'라고 말해 주었어요/)).toBeInTheDocument()
    expect(requestWrapup).toHaveBeenCalledTimes(1)
  })

  it('falls back to the fixed takeaway when the wrap-up cannot be written', async () => {
    requestWrapup.mockRejectedValueOnce(new Error('offline'))
    saveStepGame(episode, finished('잘 모르겠어요'))
    renderPlay()
    expect(await screen.findByText(episode.takeaway)).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
