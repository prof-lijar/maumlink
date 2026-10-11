import { z } from 'zod'
import { ConversationSchema } from './conversation'

const Id = z.string().min(1)
const Choice = z.object({ id: Id, text: z.string().min(1), feedback: z.string().min(1) })
const SequenceCard = z.object({ id: Id, text: z.string().min(1) })
export const BehaviorEpisodeSchema = z
  .object({
    id: z.string().regex(/^[ABCD]\d{2}$/),
    version: z.number().int().positive(),
    domainId: z.enum(['A', 'B', 'C', 'D']),
    title: z.string().min(1),
    situation: z.object({ text: z.string().min(1), alt: z.string().min(1) }),
    choice: z.object({
      prompt: z.string().min(1),
      choices: z.array(Choice).min(2),
      acceptedChoiceIds: z.array(Id).min(1),
      hint: z.string().min(1),
      modelChoiceId: Id,
    }),
    sorting: z.object({
      kind: z.literal('behavior_sort'),
      prompt: z.string().min(1),
      cards: z
        .array(
          z.object({
            id: Id,
            text: z.string().min(1),
            category: z.enum(['do', 'rethink']),
            feedback: z.string().min(1),
          }),
        )
        .min(4)
        .max(6),
      hint: z.string().min(1),
      feedback: z.string().min(1),
    }),
    // Historical source material, retained but not played in the current flow.
    sequence: z.object({
      prompt: z.string().min(1),
      cards: z.array(SequenceCard).min(2),
      acceptedOrders: z.array(z.array(Id)).min(1),
      hint: z.string().min(1),
      feedback: z.string().min(1),
      modelOrder: z.array(Id),
    }),
    /** Optional 친구와 대화하기 between the choice result and sorting (skippable). */
    conversation: ConversationSchema.optional(),
    takeaway: z.string().min(1),
    safetyNote: z.string().min(1),
    review: z.object({
      state: z.enum(['draft', 'reviewed', 'published', 'retired']),
      educatorSafetyNote: z.string().min(1).optional(),
      source: z.string().min(1).optional(),
    }),
  })
  .superRefine((episode, ctx) => {
    const sortIds = episode.sorting.cards.map((card) => card.id)
    if (new Set(sortIds).size !== sortIds.length)
      ctx.addIssue({ code: 'custom', message: 'Sorting card IDs must be unique' })
    if (
      !['do', 'rethink'].every((category) =>
        episode.sorting.cards.some((card) => card.category === category),
      )
    )
      ctx.addIssue({ code: 'custom', message: 'Sorting must include both categories' })
    const choiceIds = episode.choice.choices.map((choice) => choice.id)
    const cardIds = episode.sequence.cards.map((card) => card.id)
    if (new Set(choiceIds).size !== choiceIds.length)
      ctx.addIssue({ code: 'custom', message: 'Choice IDs must be unique' })
    if (new Set(cardIds).size !== cardIds.length)
      ctx.addIssue({ code: 'custom', message: 'Sequence card IDs must be unique' })
    for (const id of [...episode.choice.acceptedChoiceIds, episode.choice.modelChoiceId]) {
      if (!choiceIds.includes(id)) ctx.addIssue({ code: 'custom', message: `Unknown choice ${id}` })
    }
    if (!episode.choice.acceptedChoiceIds.includes(episode.choice.modelChoiceId))
      ctx.addIssue({ code: 'custom', message: 'Model choice must be accepted' })
    for (const order of [...episode.sequence.acceptedOrders, episode.sequence.modelOrder]) {
      if (
        order.length !== cardIds.length ||
        new Set(order).size !== cardIds.length ||
        order.some((id) => !cardIds.includes(id))
      )
        ctx.addIssue({ code: 'custom', message: 'Every order must use every card exactly once' })
    }
    if (
      !episode.sequence.acceptedOrders.some(
        (order) => order.join('|') === episode.sequence.modelOrder.join('|'),
      )
    )
      ctx.addIssue({ code: 'custom', message: 'Model order must be accepted' })
  })

export type BehaviorEpisode = z.infer<typeof BehaviorEpisodeSchema>
