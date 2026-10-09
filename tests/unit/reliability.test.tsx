import { MemoryRouter, Routes, Route } from 'react-router'
import { Lesson } from '@/screens/lesson/Lesson'
import { StrictMode } from 'react'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { validScenario } from '../fixtures/content'
import { initialLessonState, reduce } from '@/engine/lessonMachine'
import { loadSession, saveSession } from '@/engine/persistence'
import { useLesson } from '@/engine/store'
import { useProgress, StoredProgress } from '@/services/progress'
import { useSettings, StoredSettings } from '@/services/settings'
import { speech } from '@/services/speech'
import { useAutoRead } from '@/services/useSpeak'
import { Sheet } from '@/design/Sheet'

const scenario = validScenario()

beforeEach(() => {
  sessionStorage.clear()
  useLesson.getState().reset()
  useProgress.setState({ entries: {} })
})

describe('session recovery', () => {
  it('preserves a valid screen and selection on reload', () => {
    const state = {
      ...initialLessonState(scenario.id),
      step: 'step3' as const,
      feelingIds: ['angry'],
    }
    saveSession(state)
    expect(loadSession(scenario)).toEqual(state)
  })
  it.each([
    '{broken',
    'null',
    '{}',
    JSON.stringify({ ...initialLessonState(scenario.id), step: 'unknown' }),
    JSON.stringify({ ...initialLessonState(scenario.id), feelingIds: ['deleted-emotion'] }),
    JSON.stringify({ ...initialLessonState(scenario.id), sentenceIndex: 999 }),
    JSON.stringify({ ...initialLessonState(scenario.id), step: 'feedback' }),
  ])('ignores invalid storage without crashing: %s', (value) => {
    sessionStorage.setItem('maumlink.session.v1', value)
    expect(loadSession(scenario)).toBeUndefined()
  })
  it('sanitizes invalid settings and progress without replacing store actions', () => {
    expect(StoredSettings.parse({ textSize: 'huge', sound: 'yes', setSound: null })).toEqual({
      textSize: 'normal',
      sound: true,
      avatar: 'haru',
      autoRead: true,
      voiceEnabled: true,
      started: false,
    })
    expect(StoredProgress.parse({ entries: null })).toEqual({ entries: {} })
  })
  it('counts completion once, including after restoring the wrap-up', () => {
    useLesson.getState().start(scenario)
    const send = useLesson.getState().dispatch
    for (let i = 0; i <= scenario.situation.story.length; i++) send({ type: 'NEXT' })
    send({ type: 'SELECT_FEELING', id: 'angry' })
    send({ type: 'NEXT' })
    send({ type: 'GOT_IT' })
    send({ type: 'SELECT_ACTION', id: 'C' })
    send({ type: 'CHOOSE' })
    send({ type: 'CONTINUE' })
    useLesson.getState().start(scenario)
    send({ type: 'CONTINUE' })
    expect(useProgress.getState().entries[scenario.id]?.times).toBe(1)
  })
  it('rejects unknown feelings and permits deselecting an action', () => {
    const feeling = { ...initialLessonState(scenario.id), step: 'feeling' as const }
    expect(reduce(feeling, { type: 'SELECT_FEELING', id: 'invalid' }, scenario)).toBe(feeling)
    const action = { ...feeling, step: 'action' as const, actionId: 'A' as const }
    expect(reduce(action, { type: 'SELECT_ACTION', id: 'A' }, scenario).actionId).toBeUndefined()
  })
})

describe('audio lifecycle', () => {
  it('restarts after StrictMode cleanup and responds to the auto-read setting', () => {
    useSettings.setState({ autoRead: true })
    let active = false
    const speak = vi.spyOn(speech, 'speak').mockImplementation(async () => {
      active = true
    })
    const cancel = vi.spyOn(speech, 'cancel').mockImplementation(() => {
      active = false
    })
    function Narration() {
      useAutoRead('한 문장이에요.', 'story')
      return null
    }
    const { unmount } = render(
      <StrictMode>
        <Narration />
      </StrictMode>,
    )
    expect(active).toBe(true)
    act(() => useSettings.getState().setAutoRead(false))
    expect(active).toBe(false)
    act(() => useSettings.getState().setAutoRead(true))
    expect(active).toBe(true)
    unmount()
    expect(active).toBe(false)
    speak.mockRestore()
    cancel.mockRestore()
  })
})

describe('sheet focus', () => {
  it('keeps focus on the active control when the parent updates', async () => {
    const content = (title: string) => (
      <Sheet open title={title} onClose={() => {}}>
        <button>설정 선택</button>
      </Sheet>
    )
    const { rerender } = render(content('설정'))
    const option = screen.getByRole('button', { name: '설정 선택' })
    await userEvent.click(option)
    rerender(content('새 설정'))
    expect(option).toHaveFocus()
  })
})

describe('lesson narration integration', () => {
  it('does not cancel narration after the new screen starts speaking', async () => {
    useSettings.setState({ started: true, autoRead: true, sound: false })
    let active = false
    const speak = vi.spyOn(speech, 'speak').mockImplementation(async () => {
      active = true
    })
    const cancel = vi.spyOn(speech, 'cancel').mockImplementation(() => {
      active = false
    })
    const { unmount } = render(
      <MemoryRouter initialEntries={['/lesson/mind-lunch-line']}>
        <Routes>
          <Route path="/lesson/:scenarioId" element={<Lesson />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(await screen.findByTestId('story-card')).toBeInTheDocument()
    expect(active).toBe(true)
    for (let i = 0; i < 4; i++) await userEvent.click(screen.getByTestId('nav-primary'))
    expect(screen.getByRole('checkbox', { name: '속상해요' })).toBeInTheDocument()
    expect(active).toBe(true)
    unmount()
    expect(active).toBe(false)
    speak.mockRestore()
    cancel.mockRestore()
  })
})
