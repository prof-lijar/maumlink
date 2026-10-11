import { MemoryRouter, Route, Routes } from 'react-router'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  behaviorEpisodes,
  BehaviorEpisodeSchema,
  getBehaviorEpisode,
} from '@/content/behaviorEpisode'

const legacy = getBehaviorEpisode('C02')!
import { BehaviorGame } from '@/screens/BehaviorGame'
import {
  initialGameState,
  loadGame,
  reduceGame,
  saveGame,
  type GameState,
} from '@/engine/behaviorGame'
import { useMvpProgress } from '@/services/mvpProgress'
import { useProfile } from '@/services/profile'
import { useSettings } from '@/services/settings'

beforeEach(() => {
  localStorage.clear()
  useSettings.setState({ started: true, autoRead: false })
  useProfile.setState({ avatarId: 'sun' })
  useMvpProgress.setState({ completedEpisodeIds: [] })
})

describe('choice + sorting data and engine (sample: C02)', () => {
  it('has two complete activities for every indexed episode', () => {
    // 10 choice + sorting episodes; B02, C01, C04, C05, D04 use the step format.
    expect(behaviorEpisodes).toHaveLength(10)
    expect(new Set(behaviorEpisodes.map((episode) => episode.id)).size).toBe(10)
    for (const episode of behaviorEpisodes) {
      expect(episode.choice.choices.length).toBeGreaterThanOrEqual(2)
      expect(episode.sorting.cards.length).toBe(4)
      expect(episode.review.state).toBe('draft')
    }
  })

  it('rejects incomplete or unknown answer references', () => {
    expect(
      BehaviorEpisodeSchema.safeParse({
        ...legacy,
        choice: { ...legacy.choice, acceptedChoiceIds: ['missing'] },
      }).success,
    ).toBe(false)
    expect(
      BehaviorEpisodeSchema.safeParse({
        ...legacy,
        sequence: { ...legacy.sequence, acceptedOrders: [['pause', 'pause', 'speak']] },
      }).success,
    ).toBe(false)
  })

  it('stays on the question after a wrong choice, then opens hint and example', () => {
    let state = initialGameState()
    state = reduceGame(state, { type: 'submitChoice' }, legacy)
    expect(state).toEqual(initialGameState())
    state = reduceGame(state, { type: 'selectChoice', id: 'A' }, legacy)
    state = reduceGame(state, { type: 'submitChoice' }, legacy)
    expect(state).toMatchObject({ step: 'choice', choiceWrong: true, hintVisible: true })
    expect(state.modelVisible).toBe(false)
    state = reduceGame(state, { type: 'selectChoice', id: 'C' }, legacy)
    expect(state.choiceWrong).toBe(false)
    state = reduceGame(state, { type: 'submitChoice' }, legacy)
    expect(state.modelVisible).toBe(true)
    state = reduceGame(state, { type: 'toggleHint' }, legacy)
    expect(state.hintVisible).toBe(false)
    state = reduceGame(state, { type: 'selectChoice', id: 'B' }, legacy)
    state = reduceGame(state, { type: 'submitChoice' }, legacy)
    expect(state).toMatchObject({ step: 'choiceFeedback', choiceOutcome: 'supported' })
  })

  function sortingState(): GameState {
    let state = reduceGame(initialGameState(), { type: 'selectChoice', id: 'B' }, legacy)
    state = reduceGame(state, { type: 'submitChoice' }, legacy)
    return toSorting(reduceGame(state, { type: 'next' }, legacy))
  }
  /** C02 has a 친구와 대화하기 stage before sorting; skipping it is allowed. */
  function toSorting(state: GameState): GameState {
    return state.step === 'conversation'
      ? reduceGame(state, { type: 'skipConversation' }, legacy)
      : state
  }

  it('requires every card and an explicit check, preserves placements after errors, and permits corrections', () => {
    let state = sortingState()
    expect(reduceGame(state, { type: 'categorize', category: 'do' }, legacy)).toBe(state)
    expect(reduceGame(state, { type: 'submitSort' }, legacy)).toBe(state)
    expect(reduceGame(state, { type: 'next' }, legacy)).toBe(state)
    expect(reduceGame(state, { type: 'selectCard', id: 'missing' }, legacy)).toBe(state)
    for (const card of legacy.sorting.cards) {
      state = reduceGame(state, { type: 'selectCard', id: card.id }, legacy)
      state = reduceGame(state, { type: 'categorize', category: 'rethink' }, legacy)
    }
    expect(state.sortOutcome).toBeNull()
    const placements = { ...state.placements }
    state = reduceGame(state, { type: 'submitSort' }, legacy)
    expect(state.placements).toEqual(placements)
    expect(state.sortWrongIds).toEqual(['ask', 'return'])
    expect(state.hintVisible).toBe(true)
    state = reduceGame(state, { type: 'submitSort' }, legacy)
    expect(state.modelVisible).toBe(true)
    for (const card of legacy.sorting.cards.filter((c) => c.category === 'do')) {
      state = reduceGame(state, { type: 'selectCard', id: card.id }, legacy)
      state = reduceGame(state, { type: 'categorize', category: card.category }, legacy)
    }
    expect(state.sortOutcome).toBeNull()
    state = reduceGame(state, { type: 'submitSort' }, legacy)
    expect(state.sortOutcome).toBe('supported')
    expect(reduceGame(state, { type: 'selectCard', id: 'ask' }, legacy)).toBe(state)
    state = reduceGame(state, { type: 'next' }, legacy)
    expect(state.step).toBe('sortingFeedback')
    expect(reduceGame(state, { type: 'next' }, legacy).step).toBe('complete')
  })

  it('drops a named card without prior selection, reclassifies it, and rejects unknown cards', () => {
    let state = sortingState()
    expect(reduceGame(state, { type: 'dropCard', id: 'missing', category: 'do' }, legacy)).toBe(
      state,
    )
    state = reduceGame(state, { type: 'dropCard', id: 'return', category: 'rethink' }, legacy)
    expect(state.placements).toEqual({ return: 'rethink' })
    expect(state.selectedCardId).toBeNull()
    state = reduceGame(state, { type: 'dropCard', id: 'return', category: 'do' }, legacy)
    expect(state.placements).toEqual({ return: 'do' })
    expect(state.sortOutcome).toBeNull()
    expect(reduceGame(state, { type: 'submitSort' }, legacy)).toBe(state)
  })

  it('can finish every episode in any card order, including after using the model', () => {
    for (const episode of behaviorEpisodes) {
      let state = reduceGame(
        initialGameState(),
        { type: 'selectChoice', id: episode.choice.modelChoiceId },
        episode,
      )
      state = reduceGame(state, { type: 'submitChoice' }, episode)
      state = reduceGame(state, { type: 'next' }, episode)
      if (state.step === 'conversation')
        state = reduceGame(state, { type: 'skipConversation' }, episode)
      for (const card of [...episode.sorting.cards].reverse()) {
        state = reduceGame(state, { type: 'selectCard', id: card.id }, episode)
        state = reduceGame(state, { type: 'categorize', category: card.category }, episode)
      }
      state = reduceGame(state, { type: 'submitSort' }, episode)
      expect(state.sortOutcome).toBe('independent')
      state = reduceGame(state, { type: 'next' }, episode)
      state = reduceGame(state, { type: 'next' }, episode)
      expect(state.step).toBe('complete')
    }
    let state = reduceGame(sortingState(), { type: 'applySortModel' }, legacy)
    expect(state.sortOutcome).toBeNull()
    expect(reduceGame(state, { type: 'next' }, legacy)).toBe(state)
    state = reduceGame(state, { type: 'submitSort' }, legacy)
    expect(state.sortOutcome).toBe('supported')
  })

  it('restores a partial classification and rejects fabricated completion and old sequence sessions', () => {
    let state = reduceGame(sortingState(), { type: 'selectCard', id: 'return' }, legacy)
    state = reduceGame(state, { type: 'categorize', category: 'do' }, legacy)
    saveGame(legacy, state)
    expect(loadGame(legacy)).toEqual({ kind: 'valid', state })
    saveGame(legacy, { ...state, step: 'complete', sortOutcome: 'independent' })
    expect(loadGame(legacy)).toEqual({ kind: 'invalid' })
    saveGame(legacy, { ...state, placements: { missing: 'do' } })
    expect(loadGame(legacy)).toEqual({ kind: 'invalid' })
    const old = JSON.stringify({
      packId: 'mvp-v1',
      episodeId: 'C02',
      contentVersion: legacy.version - 1,
      state: { step: 'sequence', orderIds: ['pause'] },
    })
    localStorage.setItem('maumlink.session.mvp-v1.C02', old)
    expect(loadGame(legacy)).toEqual({ kind: 'invalid' })
    expect(localStorage.getItem('maumlink.session.mvp-v1.C02')).toBe(old)
    expect(useMvpProgress.getState().completedEpisodeIds).toEqual([])
  })

  it('validates sorting IDs, categories, explanations, and both baskets', () => {
    for (const cards of [
      [
        legacy.sorting.cards[0],
        ...legacy.sorting.cards.slice(1).map((c) => ({ ...c, id: legacy.sorting.cards[0]!.id })),
      ],
      legacy.sorting.cards.map((c) => ({ ...c, category: 'do' })),
      legacy.sorting.cards.map((c) => ({ ...c, feedback: '' })),
      legacy.sorting.cards.map((c) => ({ ...c, category: 'unknown' })),
      legacy.sorting.cards.slice(0, 3),
    ])
      expect(
        BehaviorEpisodeSchema.safeParse({ ...legacy, sorting: { ...legacy.sorting, cards } })
          .success,
      ).toBe(false)
  })

  it('restores a versioned partial session and explains invalid saved content', () => {
    const state = reduceGame(initialGameState(), { type: 'selectChoice', id: 'B' }, legacy)
    expect(saveGame(legacy, state)).toBe(true)
    expect(loadGame(legacy)).toEqual({ kind: 'valid', state })
    expect(loadGame(behaviorEpisodes.find((episode) => episode.id === 'A01')!)).toEqual({
      kind: 'empty',
    })
    localStorage.setItem('maumlink.session.mvp-v1.C02', '{bad json')
    expect(loadGame(legacy)).toEqual({ kind: 'invalid' })
    localStorage.setItem(
      'maumlink.session.mvp-v1.C02',
      JSON.stringify({
        packId: 'mvp-v1',
        episodeId: legacy.id,
        contentVersion: legacy.version + 1,
        state,
      }),
    )
    expect(loadGame(legacy)).toEqual({ kind: 'invalid' })
  })

  it('keeps unfinished sessions for different episodes separate', () => {
    const a01 = behaviorEpisodes.find((episode) => episode.id === 'A01')!
    const a01State = reduceGame(initialGameState(), { type: 'selectChoice', id: 'A' }, a01)
    const b02State = reduceGame(initialGameState(), { type: 'selectChoice', id: 'B' }, legacy)
    expect(saveGame(a01, a01State)).toBe(true)
    expect(saveGame(legacy, b02State)).toBe(true)
    expect(loadGame(a01)).toEqual({ kind: 'valid', state: a01State })
    expect(loadGame(legacy)).toEqual({ kind: 'valid', state: b02State })
  })

  it('reports when local session storage cannot be written', () => {
    const blocked = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage blocked')
    })
    expect(saveGame(legacy, initialGameState())).toBe(false)
    blocked.mockRestore()
  })
})

it('completes both activities and records the episode only once', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={['/episode/C02/play']}>
      <Routes>
        <Route path="/episode/:episodeId/play" element={<BehaviorGame />} />
      </Routes>
    </MemoryRouter>,
  )
  expect(screen.getByRole('button', { name: '선택 확인하기' })).toBeDisabled()
  await user.click(screen.getByRole('radio', { name: /친구가 보지 않을 때/ }))
  await user.click(screen.getByRole('button', { name: '선택 확인하기' }))
  expect(screen.getByText('다시 한 번 생각해 볼까요?')).toBeInTheDocument()
  expect(screen.getByText(legacy.choice.hint)).toBeInTheDocument()
  await user.click(screen.getByRole('radio', { name: /빌려도 돼/ }))
  expect(screen.queryByText('다시 한 번 생각해 볼까요?')).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: '선택 확인하기' }))
  await waitFor(() =>
    expect(screen.getByRole('heading', { name: '좋은 방법을 골랐어요' })).toHaveFocus(),
  )
  await talkThrough(user)
  expect(screen.getByRole('button', { name: '나눈 내용 확인하기' })).toBeDisabled()
  expect(screen.getByRole('button', { name: '이렇게 해요' })).toBeDisabled()
  await user.click(screen.getByRole('button', { name: legacy.sorting.cards[0]!.text }))
  await user.click(screen.getByRole('button', { name: '이렇게 해요' }))
  // 다시 해보기 clears only the mission's placements.
  await user.click(screen.getByRole('button', { name: '다시 해보기' }))
  expect(screen.getByRole('button', { name: '나눈 내용 확인하기' })).toBeDisabled()
  expect(screen.queryByRole('button', { name: '다시 해보기' })).not.toBeInTheDocument()
  for (const card of legacy.sorting.cards) {
    await user.click(screen.getByRole('button', { name: card.text }))
    await user.click(screen.getByRole('button', { name: '안돼요' }))
  }
  await user.click(screen.getByRole('button', { name: '나눈 내용 확인하기' }))
  expect(screen.getByText('이 카드를 다시 살펴봐요.')).toBeInTheDocument()
  for (const card of legacy.sorting.cards.filter((c) => c.category === 'do')) {
    await user.click(screen.getByRole('button', { name: card.text }))
    await user.click(screen.getByRole('button', { name: '이렇게 해요' }))
  }
  await user.click(screen.getByRole('button', { name: '나눈 내용 확인하기' }))
  expect(screen.getByText('모두 알맞게 나눴어요!')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: '다음' }))
  expect(screen.getByRole('heading', { name: '행동을 나눴어요' })).toHaveFocus()
  await user.click(screen.getByRole('button', { name: '오늘 배운 내용 보기' }))
  await waitFor(() => expect(useMvpProgress.getState().completedEpisodeIds).toEqual(['C02']))
  expect(
    screen.getByRole('heading', { name: '잘했어요! 오늘도 새로운 방법을 배웠어요.' }),
  ).toBeInTheDocument()
  expect(screen.getByText(legacy.takeaway)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '다른 이야기 만나기' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '탐험 지도로 돌아가기' })).toBeInTheDocument()
  expect(screen.getByText('완료한 이야기 1 / 15')).toBeInTheDocument()
  expect(screen.getByText('7%')).toBeInTheDocument()
  expect(localStorage.getItem('maumlink.progress.v1')).toBeNull()
  await user.click(screen.getByRole('button', { name: '다시 연습하기' }))
  expect(useMvpProgress.getState().completedEpisodeIds).toEqual(['C02'])
})

it('이전으로 steps back through the choice + sorting screens and keeps the work', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={['/episode/C02/play']}>
      <Routes>
        <Route path="/episode/:episodeId/play" element={<BehaviorGame />} />
      </Routes>
    </MemoryRouter>,
  )
  expect(screen.queryByRole('button', { name: '이전으로' })).not.toBeInTheDocument()
  await user.click(screen.getByRole('radio', { name: /빌려도 돼/ }))
  await user.click(screen.getByRole('button', { name: '선택 확인하기' }))
  await talkThrough(user)
  await user.click(screen.getByRole('button', { name: legacy.sorting.cards[0]!.text }))
  await user.click(screen.getByRole('button', { name: '이렇게 해요' }))
  await user.click(screen.getByRole('button', { name: '이전으로' }))
  // Back to the finished conversation, which keeps its log.
  expect(screen.getByRole('heading', { name: legacy.conversation!.title })).toBeInTheDocument()
  expect(screen.getByText(legacy.conversation!.closing)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: '이전으로' }))
  expect(screen.getByRole('heading', { name: '좋은 방법을 골랐어요' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: '이전으로' }))
  expect(screen.getByRole('radio', { name: /빌려도 돼/ })).toHaveAttribute('aria-checked', 'true')
  // The saved state after going back is still a valid session.
  expect(loadGame(legacy).kind).toBe('valid')
  await user.click(screen.getByRole('button', { name: '선택 확인하기' }))
  await user.click(screen.getByRole('button', { name: '친구와 대화하기로' }))
  await user.click(screen.getByRole('button', { name: '좋은 행동 나누기로' }))
  expect(screen.getByText('4장 중 1장을 나눴어요.')).toBeInTheDocument()
})

/** Says the first good line on each turn of C02's conversation, then moves on to sorting. */
async function talkThrough(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: '친구와 대화하기로' }))
  for (const turn of legacy.conversation!.turns)
    await user.click(screen.getByRole('button', { name: turn.options.find((o) => o.good)!.text }))
  await user.click(screen.getByRole('button', { name: '좋은 행동 나누기로' }))
}

it('친구와 대화하기: each line gets its own reply, a tip and a retry; skipping still reaches sorting', () => {
  const talk = legacy.conversation!
  let state = reduceGame(initialGameState(), { type: 'selectChoice', id: 'B' }, legacy)
  state = reduceGame(state, { type: 'submitChoice' }, legacy)
  state = reduceGame(state, { type: 'next' }, legacy)
  expect(state.step).toBe('conversation')
  expect(reduceGame(state, { type: 'next' }, legacy)).toBe(state)
  const notGood = talk.turns[0]!.options.find((o) => !o.good)!
  state = reduceGame(state, { type: 'say', id: notGood.id }, legacy)
  expect(state.conversation).toMatchObject({ turn: 0, said: [{ turn: 0, id: notGood.id }] })
  for (const turn of talk.turns)
    state = reduceGame(state, { type: 'say', id: turn.options.find((o) => o.good)!.id }, legacy)
  expect(state.conversation!.turn).toBe(talk.turns.length)
  saveGame(legacy, state)
  expect(loadGame(legacy).kind).toBe('valid')
  expect(reduceGame(state, { type: 'next' }, legacy).step).toBe('sorting')
  expect(reduceGame(state, { type: 'back' }, legacy).step).toBe('choiceFeedback')
  const fresh = reduceGame(state, { type: 'resetConversation' }, legacy)
  expect(fresh.conversation).toMatchObject({ turn: 0, said: [] })
  expect(reduceGame(fresh, { type: 'skipConversation' }, legacy).step).toBe('sorting')
})
