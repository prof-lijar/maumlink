import { z } from 'zod'
import type { ConversationData } from '@/content/conversation'

export const ConversationStateSchema = z.object({
  kind: z.literal('conversation'),
  /** Every line said so far, in order; the chat log is rebuilt from it. */
  said: z.array(z.object({ turn: z.number().int().nonnegative(), id: z.string() })),
  /** The turn waiting for the child; equal to turns.length when the talk is finished. */
  turn: z.number().int().nonnegative(),
})
export type ConversationState = z.infer<typeof ConversationStateSchema>
export type ConversationEvent = { type: 'say'; id: string } | { type: 'reset' }

export const initialConversation = (): ConversationState => ({
  kind: 'conversation',
  said: [],
  turn: 0,
})

export function reduceConversation(
  state: ConversationState,
  event: ConversationEvent,
  talk: ConversationData,
): ConversationState {
  if (event.type === 'reset') return initialConversation()
  const turn = talk.turns[state.turn]
  const line = turn?.options.find((option) => option.id === event.id)
  if (!line) return state
  return {
    ...state,
    said: [...state.said, { turn: state.turn, id: line.id }],
    turn: line.good ? state.turn + 1 : state.turn,
  }
}

export const conversationDone = (state: ConversationState, talk: ConversationData) =>
  state.turn >= talk.turns.length

/** Saved logs must replay to the saved turn with lines that exist. */
export function validConversation(state: ConversationState, talk: ConversationData): boolean {
  let turn = 0
  for (const entry of state.said) {
    const line = talk.turns[entry.turn]?.options.find((option) => option.id === entry.id)
    if (!line || entry.turn !== turn) return false
    if (line.good) turn += 1
  }
  return turn === state.turn && turn <= talk.turns.length
}
