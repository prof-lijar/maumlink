import { MemoryRouter, Route, Routes } from 'react-router'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EpisodePlay } from '@/screens/EpisodePlay'
import { Home } from '@/screens/Home'
import { getStepEpisode } from '@/content/episodes'
import { speech } from '@/services/speech'
import { useMvpProgress } from '@/services/mvpProgress'
import { avatarIds, useProfile } from '@/services/profile'
import { useSettings } from '@/services/settings'

const d01 = getStepEpisode('D01')!

beforeEach(() => {
  localStorage.clear()
  useSettings.setState({ started: true, autoRead: true, voiceEnabled: true })
  useProfile.setState({ avatarId: avatarIds[0] })
  useMvpProgress.setState({ completedEpisodeIds: [] })
})
afterEach(() => vi.restoreAllMocks())

function play(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/episode/${id}/play`]}>
      <Routes>
        <Route path="/episode/:episodeId/play" element={<EpisodePlay />} />
      </Routes>
    </MemoryRouter>,
  )
}
const spoken = (speak: { mock: { calls: unknown[][] } }) =>
  speak.mock.calls.map((call) => (call[0] as { text: string }).text)

describe('음성 읽어주기', () => {
  it('reads the situation, then each step prompt, and the option a child picks', async () => {
    const speak = vi.spyOn(speech, 'speak').mockResolvedValue(undefined)
    vi.spyOn(speech, 'cancel').mockImplementation(() => {})
    const user = userEvent.setup()
    play('D01')
    expect(spoken(speak)).toContain(d01.situation.sentences.join(' '))
    expect(speak.mock.calls[0]![0]).toMatchObject({ locale: 'ko', automatic: true })
    await user.click(screen.getByRole('button', { name: '다음' }))
    const reflect = d01.steps[0]!
    if (reflect.kind !== 'reflect') throw new Error('D01 should open with a reflect step')
    expect(spoken(speak)).toContain(reflect.prompt)
    const option = reflect.options[0]!
    await user.click(screen.getByRole('radio', { name: option.text }))
    expect(spoken(speak).at(-1)).toBe(
      [option.text, option.feedback, reflect.closing].filter(Boolean).join(' '),
    )
    expect(speak.mock.calls.at(-1)![0]).not.toHaveProperty('automatic', true)
  })

  it('stays silent while narration is muted and the header toggle turns it back on', async () => {
    const speak = vi.spyOn(speech, 'speak').mockResolvedValue(undefined)
    vi.spyOn(speech, 'cancel').mockImplementation(() => {})
    const unlock = vi.spyOn(speech, 'unlock').mockImplementation(() => {})
    useSettings.setState({ voiceEnabled: false })
    const user = userEvent.setup()
    play('D01')
    expect(screen.getByRole('button', { name: '음성 켜기' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    await user.click(screen.getByRole('button', { name: '음성 켜기' }))
    expect(useSettings.getState().voiceEnabled).toBe(true)
    expect(unlock).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: '음성 끄기' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await user.click(screen.getByRole('button', { name: '음성 끄기' }))
    expect(useSettings.getState().voiceEnabled).toBe(false)
    expect(speak).toHaveBeenCalled()
  })

  it('opens adult settings from the map home', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByRole('button', { name: /음성 (켜기|끄기)/ })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '어른 설정' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
