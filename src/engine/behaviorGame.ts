import { z } from 'zod'
import type { BehaviorEpisode } from '@/content/behaviorEpisode'
import {
  ConversationStateSchema,
  conversationDone,
  initialConversation,
  reduceConversation,
  validConversation,
} from './conversation'

const CategorySchema = z.enum(['do', 'rethink'])
export type SortCategory = z.infer<typeof CategorySchema>
export const GameStateSchema = z.object({
  step: z.enum([
    'choice',
    'choiceFeedback',
    'conversation',
    'sorting',
    'sortingFeedback',
    'complete',
  ]),
  selectedChoiceId: z.string().nullable(),
  choiceWrong: z.boolean(),
  choiceAttempts: z.number().int().nonnegative(),
  choiceHelpUsed: z.boolean(),
  choiceOutcome: z.enum(['independent', 'supported', 'modeled']).nullable(),
  selectedCardId: z.string().nullable(),
  placements: z.record(z.string(), CategorySchema),
  sortWrongIds: z.array(z.string()),
  sortAttempts: z.number().int().nonnegative(),
  sortHelpUsed: z.boolean(),
  sortOutcome: z.enum(['independent', 'supported', 'modeled']).nullable(),
  hintVisible: z.boolean(),
  modelVisible: z.boolean(),
  /** 친구와 대화하기 log, for episodes that have a conversation. */
  conversation: ConversationStateSchema.nullable().default(null),
})
export type GameState = z.infer<typeof GameStateSchema>

export type GameEvent =
  | { type: 'selectChoice'; id: string }
  | { type: 'submitChoice' }
  | { type: 'selectCard'; id: string }
  | { type: 'categorize'; category: SortCategory }
  | { type: 'dropCard'; id: string; category: SortCategory }
  | { type: 'submitSort' }
  | { type: 'applySortModel' }
  /** Clear only the mission's placements so the child can sort again. */
  | { type: 'resetSort' }
  | { type: 'toggleHint' }
  | { type: 'toggleModel' }
  | { type: 'next' }
  /** 이전으로: one screen back; answers and placements are kept. */
  | { type: 'back' }
  | { type: 'restart' }
  | { type: 'say'; id: string }
  | { type: 'resetConversation' }
  | { type: 'skipConversation' }

export const initialGameState = (): GameState => ({
  step: 'choice',
  selectedChoiceId: null,
  choiceWrong: false,
  choiceAttempts: 0,
  choiceHelpUsed: false,
  choiceOutcome: null,
  selectedCardId: null,
  placements: {},
  sortWrongIds: [],
  sortAttempts: 0,
  sortHelpUsed: false,
  sortOutcome: null,
  hintVisible: false,
  modelVisible: false,
  conversation: null,
})

export function reduceGame(
  state: GameState,
  event: GameEvent,
  episode: BehaviorEpisode,
): GameState {
  if (event.type === 'restart' && state.step === 'complete') return initialGameState()
  if (event.type === 'toggleHint' && (state.step === 'choice' || state.step === 'sorting'))
    return {
      ...state,
      hintVisible: !state.hintVisible,
      ...(state.hintVisible
        ? {}
        : state.step === 'choice'
          ? { choiceHelpUsed: true }
          : { sortHelpUsed: true }),
    }
  if (event.type === 'toggleModel' && (state.step === 'choice' || state.step === 'sorting'))
    return {
      ...state,
      modelVisible: !state.modelVisible,
      ...(state.step === 'choice' ? { choiceHelpUsed: true } : { sortHelpUsed: true }),
    }

  if (event.type === 'resetSort' && (state.step === 'sorting' || state.step === 'sortingFeedback'))
    return {
      ...state,
      step: 'sorting',
      selectedCardId: null,
      placements: {},
      sortWrongIds: [],
      sortOutcome: null,
      hintVisible: false,
      modelVisible: false,
    }

  if (event.type === 'back') {
    const clear = { hintVisible: false, modelVisible: false, selectedCardId: null }
    // Back to the question re-opens it: the child confirms the choice again.
    if (state.step === 'choiceFeedback')
      return { ...state, ...clear, step: 'choice', choiceOutcome: null }
    if (state.step === 'conversation') return { ...state, ...clear, step: 'choiceFeedback' }
    if (state.step === 'sorting')
      return { ...state, ...clear, step: episode.conversation ? 'conversation' : 'choiceFeedback' }
    if (state.step === 'sortingFeedback') return { ...state, ...clear, step: 'sorting' }
    return state
  }

  switch (state.step) {
    case 'choice':
      if (event.type === 'selectChoice' && episode.choice.choices.some((c) => c.id === event.id))
        return { ...state, selectedChoiceId: event.id, choiceWrong: false }
      if (event.type === 'submitChoice' && state.selectedChoiceId) {
        if (episode.choice.acceptedChoiceIds.includes(state.selectedChoiceId))
          return {
            ...state,
            step: 'choiceFeedback',
            choiceWrong: false,
            choiceOutcome:
              state.choiceAttempts === 0 && !state.choiceHelpUsed ? 'independent' : 'supported',
            hintVisible: false,
            modelVisible: false,
          }
        const attempts = state.choiceAttempts + 1
        return {
          ...state,
          choiceWrong: true,
          choiceAttempts: attempts,
          choiceHelpUsed: true,
          hintVisible: true,
          modelVisible: state.modelVisible || attempts >= 2,
        }
      }
      return state
    case 'choiceFeedback':
      if (event.type === 'next')
        return episode.conversation
          ? {
              ...state,
              step: 'conversation',
              conversation: state.conversation ?? initialConversation(),
            }
          : { ...state, step: 'sorting' }
      return state
    case 'conversation': {
      const talk = episode.conversation
      const current = state.conversation ?? initialConversation()
      if (!talk) return state
      if (event.type === 'say')
        return { ...state, conversation: reduceConversation(current, event, talk) }
      if (event.type === 'resetConversation')
        return { ...state, conversation: reduceConversation(current, { type: 'reset' }, talk) }
      // 상황별 미션: finishing the talk or skipping it both lead on to sorting.
      if (
        (event.type === 'next' && conversationDone(current, talk)) ||
        event.type === 'skipConversation'
      )
        return { ...state, step: 'sorting' }
      return state
    }
    case 'sorting': {
      if (event.type === 'next' && state.sortOutcome) return { ...state, step: 'sortingFeedback' }
      if (state.sortOutcome) return state
      if (event.type === 'selectCard' && episode.sorting.cards.some((c) => c.id === event.id))
        return { ...state, selectedCardId: event.id }
      if (event.type === 'categorize' || event.type === 'dropCard') {
        const id = event.type === 'dropCard' ? event.id : state.selectedCardId
        if (!id || !episode.sorting.cards.some((card) => card.id === id)) return state
        return {
          ...state,
          placements: { ...state.placements, [id]: event.category },
          sortWrongIds: state.sortWrongIds.filter((wrongId) => wrongId !== id),
          selectedCardId: null,
        }
      }
      if (event.type === 'applySortModel')
        return {
          ...state,
          placements: Object.fromEntries(episode.sorting.cards.map((c) => [c.id, c.category])),
          selectedCardId: null,
          sortWrongIds: [],
          sortHelpUsed: true,
          modelVisible: true,
        }
      if (
        event.type === 'submitSort' &&
        episode.sorting.cards.every((c) => state.placements[c.id])
      ) {
        const wrong = episode.sorting.cards
          .filter((c) => state.placements[c.id] !== c.category)
          .map((c) => c.id)
        return {
          ...state,
          selectedCardId: null,
          sortWrongIds: wrong,
          sortAttempts: state.sortAttempts + 1,
          sortOutcome: wrong.length
            ? null
            : state.sortHelpUsed || state.sortAttempts > 0
              ? 'supported'
              : 'independent',
          hintVisible: wrong.length > 0,
          modelVisible: wrong.length > 0 && (state.modelVisible || state.sortAttempts >= 1),
        }
      }
      return state
    }
    case 'sortingFeedback':
      if (event.type === 'next' && state.choiceOutcome && state.sortOutcome)
        return { ...state, step: 'complete' }
      return state
    case 'complete':
      return state
  }
}

const LEGACY_KEY = 'maumlink.session.mvp-v1'
const keyFor = (id: string) => `${LEGACY_KEY}.${id}`
const SavedSessionSchema = z.object({
  packId: z.literal('mvp-v1'),
  episodeId: z.string(),
  contentVersion: z.number().int(),
  state: GameStateSchema,
})
export type LoadResult =
  { kind: 'empty' } | { kind: 'valid'; state: GameState } | { kind: 'invalid' }

export function loadGame(episode: BehaviorEpisode): LoadResult {
  try {
    const raw =
      localStorage.getItem(keyFor(episode.id)) ??
      (episode.id === 'B02' ? localStorage.getItem(LEGACY_KEY) : null)
    if (!raw) return { kind: 'empty' }
    const saved = SavedSessionSchema.safeParse(JSON.parse(raw))
    if (!saved.success) return { kind: 'invalid' }
    if (saved.data.episodeId !== episode.id) return { kind: 'empty' }
    if (saved.data.contentVersion !== episode.version) return { kind: 'invalid' }
    const state = saved.data.state
    const choiceIds = episode.choice.choices.map((c) => c.id)
    const cardIds = episode.sorting.cards.map((c) => c.id)
    const allCorrect = episode.sorting.cards.every((c) => state.placements[c.id] === c.category)
    if (
      (state.selectedChoiceId !== null && !choiceIds.includes(state.selectedChoiceId)) ||
      (state.selectedCardId !== null && !cardIds.includes(state.selectedCardId)) ||
      Object.keys(state.placements).some((id) => !cardIds.includes(id)) ||
      new Set(state.sortWrongIds).size !== state.sortWrongIds.length ||
      state.sortWrongIds.some(
        (id) =>
          !cardIds.includes(id) ||
          !state.placements[id] ||
          episode.sorting.cards.find((c) => c.id === id)?.category === state.placements[id],
      ) ||
      (state.choiceOutcome &&
        (!state.selectedChoiceId ||
          !episode.choice.acceptedChoiceIds.includes(state.selectedChoiceId))) ||
      (state.step === 'choice' && state.choiceOutcome !== null) ||
      (state.step !== 'choice' && !state.choiceOutcome) ||
      // Sorting work may exist on earlier screens after 이전으로; only a selection may not.
      (['choice', 'choiceFeedback'].includes(state.step) && state.selectedCardId) ||
      (state.sortOutcome &&
        (!allCorrect || state.sortWrongIds.length > 0 || state.sortAttempts < 1)) ||
      (['sortingFeedback', 'complete'].includes(state.step) && !state.sortOutcome) ||
      (state.step === 'conversation' && !episode.conversation) ||
      (state.conversation !== null &&
        (!episode.conversation || !validConversation(state.conversation, episode.conversation)))
    )
      return { kind: 'invalid' }
    return { kind: 'valid', state }
  } catch {
    return { kind: 'invalid' }
  }
}

export function saveGame(episode: BehaviorEpisode, state: GameState): boolean {
  try {
    localStorage.setItem(
      keyFor(episode.id),
      JSON.stringify({
        packId: 'mvp-v1',
        episodeId: episode.id,
        contentVersion: episode.version,
        state,
      }),
    )
    return true
  } catch {
    return false
  }
}

export function clearGame(episodeId: string): void {
  try {
    localStorage.removeItem(keyFor(episodeId))
    if (episodeId === 'B02') localStorage.removeItem(LEGACY_KEY)
  } catch {
    /* Storage may be unavailable. */
  }
}
