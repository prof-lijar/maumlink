import { z } from 'zod'
import {
  ConversationStateSchema,
  conversationDone,
  initialConversation,
  validConversation,
} from './conversation'
import type {
  EmotionBodyMissionData,
  EpisodeStep,
  ExpressionChoiceMissionData,
  PerspectiveSortMissionData,
  SequenceMissionData,
  StepEpisode,
} from '@/content/stepSchema'

/* ── mission: 나와 친구의 생각 구분하기 (perspective sort) ─────────────────── */

export const PerspectiveStateSchema = z.object({
  kind: z.literal('perspective_sort'),
  selectedCardId: z.string().nullable(),
  placements: z.record(z.string(), z.string()),
  result: z.enum(['correct', 'wrong']).nullable(),
  attempts: z.number().int().nonnegative(),
  hintVisible: z.boolean(),
})
export type PerspectiveState = z.infer<typeof PerspectiveStateSchema>
export type PerspectiveEvent =
  | { type: 'selectCard'; id: string }
  | { type: 'place'; characterId: string }
  | { type: 'check' }
  | { type: 'toggleHint' }
  | { type: 'reset' }

export const initialPerspective = (): PerspectiveState => ({
  kind: 'perspective_sort',
  selectedCardId: null,
  placements: {},
  result: null,
  attempts: 0,
  hintVisible: false,
})

export function reducePerspective(
  state: PerspectiveState,
  event: PerspectiveEvent,
  mission: PerspectiveSortMissionData,
): PerspectiveState {
  if (event.type === 'toggleHint') return { ...state, hintVisible: !state.hintVisible }
  if (event.type === 'reset') return { ...initialPerspective(), attempts: state.attempts }
  if (state.result === 'correct') return state
  switch (event.type) {
    case 'selectCard':
      if (!mission.cards.some((card) => card.id === event.id)) return state
      return { ...state, selectedCardId: state.selectedCardId === event.id ? null : event.id }
    case 'place': {
      const id = state.selectedCardId
      if (!id || !mission.characters.some((person) => person.id === event.characterId)) return state
      return {
        ...state,
        placements: { ...state.placements, [id]: event.characterId },
        selectedCardId: null,
        result: null,
      }
    }
    case 'check': {
      if (!mission.cards.every((card) => state.placements[card.id])) return state
      const correct = mission.cards.every((card) => state.placements[card.id] === card.characterId)
      const attempts = state.attempts + 1
      return {
        ...state,
        selectedCardId: null,
        result: correct ? 'correct' : 'wrong',
        attempts,
        // After two misses the dialogue opens on its own (명세: 여러 번 실패하면 힌트).
        hintVisible: correct ? state.hintVisible : state.hintVisible || attempts >= 2,
      }
    }
  }
}

/* ── mission: 행동 순서 맞추기 (sequence) ──────────────────────────────────── */

export const SequenceStateSchema = z.object({
  kind: z.literal('sequence'),
  /** Display order of the cards, shuffled once when the mission starts. */
  pool: z.array(z.string()),
  placed: z.array(z.string()),
  result: z.enum(['correct', 'wrong']).nullable(),
  attempts: z.number().int().nonnegative(),
  hintVisible: z.boolean(),
})
export type SequenceState = z.infer<typeof SequenceStateSchema>
export type SequenceEvent =
  | { type: 'place'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'check' }
  | { type: 'toggleHint' }
  | { type: 'reset' }

/** Shuffle so the cards never start already in an accepted order. */
export function shuffleCards(mission: SequenceMissionData, random = Math.random): string[] {
  const ids = mission.cards.map((card) => card.id)
  const accepted = (order: string[]) =>
    mission.acceptedOrders.some((ok) => ok.join('|') === order.join('|'))
  for (let tries = 0; tries < 20; tries++) {
    const order = [...ids]
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[order[i], order[j]] = [order[j]!, order[i]!]
    }
    if (!accepted(order)) return order
  }
  return [...ids].reverse()
}

export const initialSequence = (
  mission: SequenceMissionData,
  random = Math.random,
): SequenceState => ({
  kind: 'sequence',
  pool: shuffleCards(mission, random),
  placed: [],
  result: null,
  attempts: 0,
  hintVisible: false,
})

export function reduceSequence(
  state: SequenceState,
  event: SequenceEvent,
  mission: SequenceMissionData,
): SequenceState {
  if (event.type === 'toggleHint') return { ...state, hintVisible: !state.hintVisible }
  if (event.type === 'reset') return { ...state, placed: [], result: null, hintVisible: false }
  if (state.result === 'correct') return state
  switch (event.type) {
    case 'place':
      if (state.placed.includes(event.id) || !state.pool.includes(event.id)) return state
      return { ...state, placed: [...state.placed, event.id], result: null }
    case 'remove':
      return { ...state, placed: state.placed.filter((id) => id !== event.id), result: null }
    case 'check': {
      if (state.placed.length !== mission.cards.length) return state
      const correct = mission.acceptedOrders.some(
        (order) => order.join('|') === state.placed.join('|'),
      )
      // A different order keeps the cards in place and opens the hint (명세 5.2-6).
      return {
        ...state,
        result: correct ? 'correct' : 'wrong',
        attempts: state.attempts + 1,
        hintVisible: correct ? state.hintVisible : true,
      }
    }
  }
}

/* ── mission: 감정과 신체 반응 연결하기 (emotion ↔ body) ──────────────────── */

export const EmotionBodyStateSchema = z.object({
  kind: z.literal('emotion_body_match'),
  selectedEmotionId: z.string().nullable(),
  /** One line per feeling; linking a feeling again replaces its line. */
  links: z.array(z.object({ emotionId: z.string(), bodyId: z.string() })),
  /** The most recent link, whose explanation is showing. */
  lastEmotionId: z.string().nullable(),
  hintVisible: z.boolean(),
})
export type EmotionBodyState = z.infer<typeof EmotionBodyStateSchema>
export type EmotionBodyEvent =
  | { type: 'selectEmotion'; id: string }
  | { type: 'selectBody'; id: string }
  | { type: 'toggleHint' }
  | { type: 'reset' }

export const initialEmotionBody = (): EmotionBodyState => ({
  kind: 'emotion_body_match',
  selectedEmotionId: null,
  links: [],
  lastEmotionId: null,
  hintVisible: false,
})

export function reduceEmotionBody(
  state: EmotionBodyState,
  event: EmotionBodyEvent,
  mission: EmotionBodyMissionData,
): EmotionBodyState {
  switch (event.type) {
    case 'toggleHint':
      return { ...state, hintVisible: !state.hintVisible }
    case 'reset':
      return initialEmotionBody()
    case 'selectEmotion':
      if (!mission.emotions.some((emotion) => emotion.id === event.id)) return state
      return {
        ...state,
        selectedEmotionId: state.selectedEmotionId === event.id ? null : event.id,
      }
    case 'selectBody': {
      const emotionId = state.selectedEmotionId
      if (!emotionId || !mission.bodies.some((body) => body.id === event.id)) return state
      return {
        ...state,
        selectedEmotionId: null,
        links: [
          ...state.links.filter((link) => link.emotionId !== emotionId),
          { emotionId, bodyId: event.id },
        ],
        lastEmotionId: emotionId,
      }
    }
  }
}

/** "화가 날 때 얼굴이 뜨거워지는 사람이 있어요. 내 몸에서는 …" — every pair is explained. */
export function emotionBodyFeedback(
  mission: EmotionBodyMissionData,
  emotionId: string,
  bodyId: string,
): string {
  const emotion = mission.emotions.find((item) => item.id === emotionId)
  const body = mission.bodies.find((item) => item.id === bodyId)
  if (!emotion || !body) return ''
  return `${emotion.when} ${body.who} 사람이 있어요. ${mission.feedbackTail}`
}

/* ── mission: 상황에 맞는 말 고르기 + 도움 요청 + 말하기 연습 (expression) ─── */

export const ExpressionStateSchema = z.object({
  kind: z.literal('expression_choice'),
  /** Index into situations; situations.length = the practice screen. */
  situationIndex: z.number().int().nonnegative(),
  picks: z.array(z.string().nullable()),
  listened: z.boolean(),
  practiced: z.boolean(),
  hintVisible: z.boolean().default(false),
})
export type ExpressionState = z.infer<typeof ExpressionStateSchema>
export type ExpressionEvent =
  | { type: 'pick'; id: string }
  | { type: 'nextSituation' }
  | { type: 'listened' }
  | { type: 'practiced' }
  | { type: 'reset' }
  | { type: 'toggleHint' }

export const initialExpression = (mission: ExpressionChoiceMissionData): ExpressionState => ({
  kind: 'expression_choice',
  situationIndex: 0,
  picks: mission.situations.map(() => null),
  listened: false,
  practiced: false,
  hintVisible: false,
})

const expressionPicked = (mission: ExpressionChoiceMissionData, state: ExpressionState) => {
  const situation = mission.situations[state.situationIndex]
  const pick = state.picks[state.situationIndex]
  return Boolean(situation?.choices.some((choice) => choice.id === pick))
}

export function reduceExpression(
  state: ExpressionState,
  event: ExpressionEvent,
  mission: ExpressionChoiceMissionData,
): ExpressionState {
  const onPractice = state.situationIndex >= mission.situations.length
  switch (event.type) {
    case 'reset':
      return initialExpression(mission)
    case 'toggleHint':
      return { ...state, hintVisible: !state.hintVisible }
    case 'pick': {
      const situation = mission.situations[state.situationIndex]
      if (!situation?.choices.some((choice) => choice.id === event.id)) return state
      return {
        ...state,
        picks: state.picks.map((pick, i) => (i === state.situationIndex ? event.id : pick)),
      }
    }
    case 'nextSituation':
      // Every choice gives explanatory feedback; self-expression is never forced.
      if (onPractice || !expressionPicked(mission, state)) return state
      if (state.situationIndex === mission.situations.length - 1 && !mission.practice) return state
      return { ...state, situationIndex: state.situationIndex + 1, hintVisible: false }
    case 'listened':
      return onPractice ? { ...state, listened: true } : state
    case 'practiced':
      // Listening is optional: reading the sentence is enough to finish (명세 5.1).
      return onPractice ? { ...state, practiced: true } : state
  }
}

export function expressionDone(mission: ExpressionChoiceMissionData, state: ExpressionState) {
  if (mission.practice) return state.practiced
  return state.situationIndex === mission.situations.length - 1 && expressionPicked(mission, state)
}

/* ── single picks ──────────────────────────────────────────────────────────── */

const ReflectStateSchema = z.object({
  kind: z.literal('reflect'),
  selectedId: z.string().nullable(),
})
const ChoiceStateSchema = z.object({
  kind: z.literal('choice'),
  selectedId: z.string().nullable(),
  /** The option whose feedback is showing (set when the child confirms). */
  submittedId: z.string().nullable(),
  solved: z.boolean(),
  hintVisible: z.boolean(),
})
const PlainStateSchema = z.object({ kind: z.literal('plain') })
export const StepStateSchema = z.discriminatedUnion('kind', [
  ReflectStateSchema,
  ChoiceStateSchema,
  PlainStateSchema,
  PerspectiveStateSchema,
  SequenceStateSchema,
  EmotionBodyStateSchema,
  ExpressionStateSchema,
  ConversationStateSchema,
])
export type StepState = z.infer<typeof StepStateSchema>
export type ChoiceState = z.infer<typeof ChoiceStateSchema>

export function initialStepState(step: EpisodeStep, random = Math.random): StepState {
  switch (step.kind) {
    case 'reflect':
      return { kind: 'reflect', selectedId: null }
    case 'choice':
      return {
        kind: 'choice',
        selectedId: null,
        submittedId: null,
        solved: false,
        hintVisible: false,
      }
    case 'perspective_sort':
      return initialPerspective()
    case 'sequence':
      return initialSequence(step, random)
    case 'emotion_body_match':
      return initialEmotionBody()
    case 'expression_choice':
      return initialExpression(step)
    case 'conversation':
      return initialConversation()
    default:
      return { kind: 'plain' }
  }
}

export type ChoiceEvent =
  { type: 'select'; id: string } | { type: 'submit' } | { type: 'toggleHint' }

export function reduceChoice(
  state: ChoiceState,
  event: ChoiceEvent,
  step: Extract<EpisodeStep, { kind: 'choice' }>,
): ChoiceState {
  if (event.type === 'toggleHint') return { ...state, hintVisible: !state.hintVisible }
  if (state.solved) return state
  if (event.type === 'select')
    return step.options.some((option) => option.id === event.id)
      ? { ...state, selectedId: event.id, submittedId: null }
      : state
  if (!state.selectedId) return state
  const solved = step.acceptedIds.includes(state.selectedId)
  return {
    ...state,
    submittedId: state.selectedId,
    solved,
    hintVisible: state.hintVisible || (!solved && Boolean(step.hint)),
  }
}

/** Whether the child may move on from this step. */
export function stepDone(state: StepState | undefined, step?: EpisodeStep): boolean {
  if (!state) return false
  switch (state.kind) {
    case 'emotion_body_match':
      return state.links.length > 0
    case 'expression_choice':
      return step?.kind === 'expression_choice' ? expressionDone(step, state) : false
    case 'conversation':
      return step?.kind === 'conversation' ? conversationDone(state, step) : false
    case 'reflect':
      return state.selectedId !== null
    case 'choice':
      return state.solved
    case 'plain':
      return true
    case 'perspective_sort':
    case 'sequence':
      return state.result === 'correct'
  }
}

/* ── whole episode ─────────────────────────────────────────────────────────── */

/** `screen` 0 = situation, 1…n = steps, n + 1 = completion. */
export const StepGameSchema = z.object({
  screen: z.number().int().nonnegative(),
  steps: z.array(StepStateSchema),
})
export type StepGame = z.infer<typeof StepGameSchema>

export const initialStepGame = (episode: StepEpisode, random = Math.random): StepGame => ({
  screen: 0,
  steps: episode.steps.map((step) => initialStepState(step, random)),
})

export const completionScreen = (episode: StepEpisode) => episode.steps.length + 1

const keyFor = (id: string) => `maumlink.steps.mvp-v1.${id}`
const SavedSchema = z.object({
  packId: z.literal('mvp-v1'),
  episodeId: z.string(),
  contentVersion: z.number().int(),
  state: StepGameSchema,
})

/** Saved references and completion claims must match the current content. */
function validStepState(state: StepState, step: EpisodeStep): boolean {
  if (step.kind === 'dialogue' || step.kind === 'note') return state.kind === 'plain'
  if (state.kind === 'reflect' && step.kind === 'reflect')
    return state.selectedId === null || step.options.some((o) => o.id === state.selectedId)
  if (state.kind === 'choice' && step.kind === 'choice') {
    const exists = (id: string | null) => id === null || step.options.some((o) => o.id === id)
    return (
      exists(state.selectedId) &&
      exists(state.submittedId) &&
      (!state.solved ||
        (state.selectedId === state.submittedId &&
          step.acceptedIds.includes(state.submittedId ?? '')))
    )
  }
  if (state.kind === 'expression_choice' && step.kind === 'expression_choice') {
    const max = step.situations.length - (step.practice ? 0 : 1)
    return (
      state.situationIndex <= max &&
      state.picks.length === step.situations.length &&
      state.picks.every(
        (id, i) =>
          (id !== null || i >= state.situationIndex) &&
          (id === null || step.situations[i]!.choices.some((c) => c.id === id)),
      ) &&
      (!(state.practiced || state.listened) ||
        (Boolean(step.practice) && state.situationIndex === step.situations.length))
    )
  }
  if (state.kind === 'sequence' && step.kind === 'sequence') {
    const ids = step.cards.map((c) => c.id)
    return (
      state.pool.length === ids.length &&
      new Set(state.pool).size === ids.length &&
      state.pool.every((id) => ids.includes(id)) &&
      new Set(state.placed).size === state.placed.length &&
      state.placed.every((id) => ids.includes(id)) &&
      (state.result !== 'correct' ||
        step.acceptedOrders.some((order) => order.join('|') === state.placed.join('|')))
    )
  }
  if (state.kind === 'perspective_sort' && step.kind === 'perspective_sort') {
    return (
      (state.selectedCardId === null || step.cards.some((c) => c.id === state.selectedCardId)) &&
      Object.entries(state.placements).every(
        ([id, person]) =>
          step.cards.some((c) => c.id === id) && step.characters.some((c) => c.id === person),
      ) &&
      (state.result !== 'correct' ||
        step.cards.every((c) => state.placements[c.id] === c.characterId))
    )
  }
  if (state.kind === 'conversation' && step.kind === 'conversation')
    return validConversation(state, step)
  if (state.kind === 'emotion_body_match' && step.kind === 'emotion_body_match') {
    const emotionExists = (id: string | null) =>
      id === null || step.emotions.some((e) => e.id === id)
    return (
      emotionExists(state.selectedEmotionId) &&
      emotionExists(state.lastEmotionId) &&
      new Set(state.links.map((l) => l.emotionId)).size === state.links.length &&
      state.links.every(
        (l) =>
          step.emotions.some((e) => e.id === l.emotionId) &&
          step.bodies.some((b) => b.id === l.bodyId),
      )
    )
  }
  return false
}

export type LoadedStepGame = { kind: 'empty' | 'invalid' } | { kind: 'valid'; state: StepGame }

/** Preserve incompatible saves until the user explicitly starts over. */
export function inspectStepGame(episode: StepEpisode): LoadedStepGame {
  try {
    const raw = localStorage.getItem(keyFor(episode.id))
    if (!raw) return { kind: 'empty' }
    const saved = SavedSchema.safeParse(JSON.parse(raw))
    if (
      !saved.success ||
      saved.data.episodeId !== episode.id ||
      saved.data.contentVersion !== episode.version ||
      saved.data.state.steps.length !== episode.steps.length ||
      saved.data.state.screen > completionScreen(episode) ||
      saved.data.state.steps.some(
        (state, index) => !validStepState(state, episode.steps[index]!),
      ) ||
      saved.data.state.steps.some(
        (state, index) =>
          index < saved.data.state.screen - 1 && !stepDone(state, episode.steps[index]),
      )
    )
      return { kind: 'invalid' }
    return { kind: 'valid', state: saved.data.state }
  } catch {
    return { kind: 'invalid' }
  }
}

export function loadStepGame(episode: StepEpisode): StepGame | null {
  const loaded = inspectStepGame(episode)
  return loaded.kind === 'valid' ? loaded.state : null
}

export function saveStepGame(episode: StepEpisode, state: StepGame): boolean {
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

export function clearStepGame(id: string) {
  try {
    localStorage.removeItem(keyFor(id))
  } catch {
    // Storage may be unavailable; a fresh in-memory start is enough.
  }
}
