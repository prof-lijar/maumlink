import { MemoryRouter, Route, Routes } from 'react-router'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EpisodePlay } from '@/screens/EpisodePlay'
import { getStepEpisode } from '@/content/episodes'
import { StepEpisodeSchema } from '@/content/stepSchema'
import { initialStepGame, saveStepGame } from '@/engine/stepGame'
import { useProfile } from '@/services/profile'
import { useSettings } from '@/services/settings'
import { speech } from '@/services/speech'

const episode = getStepEpisode('B01')!
const reason = '친구들이 같이 놀자고 이야기해 주지 않아서'
const feelings = ['화가 나요', '창피해요', '서운해요', '걱정돼요', '잘 모르겠어요.']
const play = () =>
  render(
    <MemoryRouter initialEntries={['/episode/B01/play']}>
      <Routes>
        <Route path="/episode/:episodeId/play" element={<EpisodePlay />} />
      </Routes>
    </MemoryRouter>,
  )

beforeEach(() => {
  localStorage.clear()
  useProfile.setState({ avatarId: 'sora' })
  useSettings.setState({ started: true, voiceInput: false, voiceEnabled: true, autoRead: true })
  vi.spyOn(speech, 'speak').mockResolvedValue(undefined)
})
afterEach(() => vi.restoreAllMocks())

describe('B01 recognizes a feeling before exploring its reasons', () => {
  it.each(feelings)('keeps the hurt reason available after choosing %s', async (feeling) => {
    const user = userEvent.setup()
    play()
    await user.click(screen.getByRole('button', { name: '다음' }))
    await user.click(screen.getByRole('radio', { name: feeling }))
    expect(screen.queryByText(reason)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '다음' }))
    const summary = screen.getByRole('region', { name: '내가 고른 감정' })
    const selection = `‘${feeling.replace(/\.$/, '')}’를 골랐어요.`
    expect(within(summary).getByRole('heading', { name: '내가 고른 감정' })).toBeInTheDocument()
    expect(within(summary).getByText(selection)).toBeInTheDocument()
    expect(within(summary).queryByText(reason)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '다음' })).not.toBeInTheDocument()
    const hurt = screen.getByRole('radio', { name: `서운해요 ${reason}` })
    expect(hurt).toHaveAttribute('aria-checked', 'false')
    expect(hurt.querySelector('img')).toHaveAttribute('src', '/img/v3/face-hurt-400.webp')
    await user.click(hurt)
    expect(within(summary).getByText(reason)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '나와 너의 생각이 다를 수 있어!' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '다음' })).toBeEnabled()
    expect(speech.speak).toHaveBeenLastCalledWith(
      expect.objectContaining({
        text: expect.stringContaining(`내가 고른 감정 ${selection} 서운해요 ${reason}`),
      }),
    )
  })

  it('does not invent a selected feeling when the previous answer was spoken', async () => {
    const game = initialStepGame(episode)
    const feeling = game.steps[0]!
    if (feeling.kind !== 'reflect') throw new Error('Expected feeling reflection')
    feeling.spoken = '친구들과 놀고 싶어요'
    game.screen = 2
    saveStepGame(episode, game)
    play()
    expect(screen.queryByRole('region', { name: '내가 고른 감정' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('radio', { name: `서운해요 ${reason}` }))
    expect(screen.getByRole('button', { name: '다음' })).toBeEnabled()
  })

  it('rejects a selection summary referring to the current or a future step', () => {
    for (const fromStep of [1, 2, 99]) {
      const data = structuredClone(episode)
      const reasonStep = data.steps[1]!
      if (reasonStep.kind !== 'reflect' || !reasonStep.selectionSummary)
        throw new Error('Missing summary')
      reasonStep.selectionSummary.fromStep = fromStep
      expect(StepEpisodeSchema.safeParse(data).success).toBe(false)
    }
  })
})
