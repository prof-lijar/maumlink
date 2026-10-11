import { z } from 'zod'

/**
 * 친구와 대화하기 (2026-10-10 사용자 요청): on my turn the child picks one of about three
 * lines; the friend answers differently to each. A `good` line earns praise and moves the
 * talk on; any other line shows the friend's honest reaction and a gentle tip, then the
 * child may say something else. Lines in parentheses are actions, not speech.
 */
const Line = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  reply: z.string().min(1),
  good: z.boolean(),
  tip: z.string().min(1),
})
export const conversationShape = {
  title: z.string().min(1),
  intro: z.string().min(1),
  partner: z.string().min(1),
  turns: z
    .array(z.object({ prompt: z.string().min(1), options: z.array(Line).min(2).max(4) }))
    .min(1),
  closing: z.string().min(1),
}
type Talk = z.infer<z.ZodObject<typeof conversationShape>>

/** Every turn needs a good line, and line IDs are unique within a turn. */
export function conversationIssues(talk: Talk): string[] {
  const issues: string[] = []
  talk.turns.forEach((turn, index) => {
    if (!turn.options.some((option) => option.good)) issues.push(`Turn ${index} needs a good line`)
    if (new Set(turn.options.map((option) => option.id)).size !== turn.options.length)
      issues.push(`Turn ${index} line IDs must be unique`)
  })
  return issues
}

export const ConversationSchema = z
  .object(conversationShape)
  .superRefine((talk, ctx) =>
    conversationIssues(talk).forEach((message) => ctx.addIssue({ code: 'custom', message })),
  )
export type ConversationData = z.infer<typeof ConversationSchema>
