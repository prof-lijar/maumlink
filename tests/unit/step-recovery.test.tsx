import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getStepEpisode } from '@/content/behaviorEpisode'
import { StepEpisodeSchema } from '@/content/stepSchema'
import {
  expressionDone,
  initialExpression,
  initialStepGame,
  inspectStepGame,
  reduceExpression,
  saveStepGame,
} from '@/engine/stepGame'
import { usePracticeVoice } from '@/services/practiceVoice'
import { speech } from '@/services/speech'
import { completionStored } from '@/services/completionStored'
import { useMvpProgress } from '@/services/mvpProgress'

const episode = getStepEpisode('D04')!
const mission = episode.steps.find((s) => s.kind === 'expression_choice')!
afterEach(() => vi.restoreAllMocks())

describe('expression practice and saved progress', () => {
  it('keeps completion usable when disk storage fails, without claiming it was saved', () => {
    useMvpProgress.setState({ completedEpisodeIds: [] })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Full', 'QuotaExceededError')
    })
    expect(() => useMvpProgress.getState().markCompleted('D04')).not.toThrow()
    expect(useMvpProgress.getState().completedEpisodeIds).toEqual(['D04'])
    expect(completionStored('D04')).toBe(false)
    expect(saveStepGame(episode, initialStepGame(episode))).toBe(false)
  })
  it('explains every choice and lets children continue without requiring direct self-expression', () => {
    for (const first of mission.situations[0]!.choices) {
      let state = initialExpression(mission)
      expect(reduceExpression(state, { type: 'nextSituation' }, mission)).toEqual(state)
      state = reduceExpression(state, { type: 'pick', id: first.id }, mission)
      state = reduceExpression(state, { type: 'toggleHint' }, mission)
      expect(state.hintVisible).toBe(true)
      state = reduceExpression(state, { type: 'nextSituation' }, mission)
      expect(state.situationIndex).toBe(1)
      expect(state.hintVisible).toBe(false)
      state = reduceExpression(state, { type: 'pick', id: 'A' }, mission)
      state = reduceExpression(state, { type: 'nextSituation' }, mission)
      expect(expressionDone(mission, state)).toBe(false)
      state = reduceExpression(state, { type: 'practiced' }, mission)
      expect(state.listened).toBe(false)
      expect(expressionDone(mission, state)).toBe(true)
      expect(reduceExpression(state, { type: 'reset' }, mission)).toEqual(
        initialExpression(mission),
      )
    }
  })

  it('rejects duplicate expression choice IDs before content can ship', () => {
    const changed = structuredClone(episode)
    const step = changed.steps.find((s) => s.kind === 'expression_choice')!
    step.situations[0]!.choices[1]!.id = step.situations[0]!.choices[0]!.id
    expect(StepEpisodeSchema.safeParse(changed).success).toBe(false)
  })

  it('keeps incompatible saves intact and rejects false completion or unknown choices', () => {
    const state = initialStepGame(episode)
    saveStepGame({ ...episode, version: episode.version - 1 }, state)
    const old = localStorage.getItem('maumlink.steps.mvp-v1.D04')
    expect(inspectStepGame(episode).kind).toBe('invalid')
    expect(localStorage.getItem('maumlink.steps.mvp-v1.D04')).toBe(old)
    state.screen = episode.steps.length + 1
    saveStepGame(episode, state)
    expect(inspectStepGame(episode).kind).toBe('invalid')
    state.screen = 0
    const expression = state.steps.find((s) => s.kind === 'expression_choice')!
    expression.situationIndex = 99
    saveStepGame(episode, state)
    expect(inspectStepGame(episode).kind).toBe('invalid')
    expression.situationIndex = 0
    expression.picks[0] = 'missing'
    saveStepGame(episode, state)
    expect(inspectStepGame(episode).kind).toBe('invalid')
    expression.picks[0] = 'C'
    saveStepGame(episode, state)
    expect(inspectStepGame(episode)).toEqual({ kind: 'valid', state })
  })

  it('stops only this practice audio when restarting, leaving, or finishing the screen', () => {
    const speak = vi.spyOn(speech, 'speak').mockResolvedValue(undefined)
    const cancel = vi.spyOn(speech, 'cancel').mockImplementation(() => {})
    vi.spyOn(speech, 'unlock').mockImplementation(() => {})
    const { result, rerender, unmount } = renderHook(({ active }) => usePracticeVoice(active), {
      initialProps: { active: true },
    })
    act(() => result.current.play('도와주세요.'))
    const first = speak.mock.calls[0]![0]
    rerender({ active: false })
    expect(cancel).toHaveBeenCalledWith(first)
    rerender({ active: true })
    act(() => result.current.play('도와주세요.'))
    const second = speak.mock.calls[1]![0]
    unmount()
    expect(cancel).toHaveBeenLastCalledWith(second)
  })
})
