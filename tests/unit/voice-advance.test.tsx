import { MemoryRouter, Route, Routes } from 'react-router'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EpisodePlay } from '@/screens/EpisodePlay'
import { useSettings } from '@/services/settings'
import { useProfile } from '@/services/profile'
import type { Recording } from '@/voice/recorder'

const recording: Recording = { audio: 'UklGR', sampleRate: 16000, durationMs: 900 }
const recorder = { stop: vi.fn(async () => recording), cancel: vi.fn() }
vi.mock('@/voice/recorder', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/voice/recorder')>()),
  microphoneSupported: () => true,
  startRecording: async () => recorder,
}))
vi.mock('@/voice/voiceApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/voice/voiceApi')>()),
  runVoiceTurn: async () => ({ transcript: '서운했어요', reply: '그렇게 느낄 수 있어요.' }),
}))

beforeEach(() => {
  localStorage.clear()
  useSettings.setState({ started: true, voiceInput: true, voiceEnabled: false, autoRead: false })
  useProfile.setState({ avatarId: 'haru' })
})

describe('a spoken turn moves the story on', () => {
  it('advances to the next step after the reply and shows a fresh mic there', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(
      <MemoryRouter initialEntries={['/episode/B01/play']}>
        <Routes>
          <Route path="/episode/:episodeId/play" element={<EpisodePlay />} />
        </Routes>
      </MemoryRouter>,
    )
    await user.click(screen.getByRole('button', { name: '다음' }))
    expect(
      screen.getByRole('heading', { name: '이 상황에서 나는 어떤 기분이 들까요?' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '말로 이야기해 볼래요' }))
    await user.click(screen.getByRole('button', { name: '말하기 시작' }))
    await user.click(await screen.findByRole('button', { name: '말하기 끝내기' }))
    expect(await screen.findByText('서운했어요')).toBeInTheDocument()
    // Narration is off, so the story waits long enough to read the reply, then moves on.
    expect(screen.getByRole('button', { name: '다음' })).toBeInTheDocument()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3600)
    })
    expect(screen.getByRole('heading', { name: '왜 그런 기분이 들었을까요?' })).toBeInTheDocument()
    // The new step starts with the mic collapsed and nothing from the last turn.
    expect(screen.getByRole('button', { name: '말로 이야기해 볼래요' })).toBeInTheDocument()
    expect(screen.queryByText('서운했어요')).not.toBeInTheDocument()
    vi.useRealTimers()
  })
})
