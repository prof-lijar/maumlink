import { z } from 'zod'
import { conversationIssues, conversationShape } from './conversation'

/**
 * Step-based episodes (2026-10-10, 2차 개선): a situation followed by an ordered list of
 * steps. Used by episodes whose activities do not fit the legacy choice + sorting flow.
 */
const Id = z.string().min(1)
const Option = z.object({ id: Id, text: z.string().min(1), feedback: z.string().min(1) })
const Line = z.object({ speaker: z.enum(['me', 'friend']), text: z.string().min(1) })

/** Ungraded pick (a feeling or a possible thought): every option is accepted. */
const ReflectStep = z.object({
  kind: z.literal('reflect'),
  label: z.string().min(1),
  prompt: z.string().min(1),
  /** Per-option feedback is optional when the source gives only the shared closing line. */
  options: z.array(Option.extend({ feedback: z.string().min(1).optional() })).min(2),
  closing: z.string().min(1),
})
/** Graded pick: wrong options explain the outcome and the child may choose again. */
const ChoiceStep = z.object({
  kind: z.literal('choice'),
  label: z.string().min(1),
  prompt: z.string().min(1),
  options: z.array(Option).min(2),
  acceptedIds: z.array(Id).min(1),
  hint: z.string().min(1).optional(),
})
const DialogueStep = z.object({
  kind: z.literal('dialogue'),
  label: z.string().min(1),
  lines: z.array(Line).min(1),
  message: z.string().min(1),
})
const PerspectiveSortStep = z.object({
  kind: z.literal('perspective_sort'),
  /** 상황별 미션: the child may skip it and still finish the episode. */
  skippable: z.boolean().optional(),
  label: z.string().min(1),
  title: z.string().min(1),
  instruction: z.string().min(1),
  characters: z.array(z.object({ id: Id, name: z.string().min(1) })).length(2),
  cards: z.array(z.object({ id: Id, text: z.string().min(1), characterId: Id })).min(2),
  correctFeedback: z.string().min(1),
  retryFeedback: z.string().min(1),
  hint: z.string().min(1),
  hintLines: z.array(Line).min(1),
})
const SequenceStep = z.object({
  kind: z.literal('sequence'),
  /** 상황별 미션: the child may skip it and still finish the episode. */
  skippable: z.boolean().optional(),
  label: z.string().min(1),
  title: z.string().min(1),
  instruction: z.string().min(1),
  cards: z.array(z.object({ id: Id, text: z.string().min(1) })).min(2),
  /** The first order is the one shown as the example; every listed order is accepted. */
  acceptedOrders: z.array(z.array(Id)).min(1),
  correctFeedback: z.string().min(1),
  retryFeedback: z.string().min(1),
  hint: z.string().min(1),
})
/**
 * 감정과 신체 반응 연결하기: tap a feeling, then a body signal. Any pair is accepted and
 * explained, because body signals differ from person to person.
 */
const EmotionBodyMatchStep = z.object({
  kind: z.literal('emotion_body_match'),
  /** 상황별 미션: the child may skip it and still finish the episode. */
  skippable: z.boolean().optional(),
  label: z.string().min(1),
  title: z.string().min(1),
  instruction: z.string().min(1),
  /** `when` completes "{when} {who} 사람이 있어요." e.g. "화가 날 때". */
  emotions: z.array(z.object({ id: Id, text: z.string().min(1), when: z.string().min(1) })).min(2),
  /** `who` is the adnominal form, e.g. "얼굴이 뜨거워지는". */
  bodies: z.array(z.object({ id: Id, text: z.string().min(1), who: z.string().min(1) })).min(2),
  feedbackTail: z.string().min(1),
  hint: z.string().min(1),
})
/** 상황에 맞는 말 고르기 → 도움 요청하기 → 말하기 연습, as one mission. */
const ExpressionChoiceStep = z.object({
  kind: z.literal('expression_choice'),
  /** 상황별 미션: the child may skip it and still finish the episode. */
  skippable: z.boolean().optional(),
  label: z.string().min(1),
  title: z.string().min(1),
  situations: z
    .array(
      z.object({
        id: Id,
        story: z.array(z.string().min(1)).min(1),
        question: z.string().min(1),
        hint: z.string().min(1).optional(),
        choices: z
          .array(
            z.object({
              id: Id,
              text: z.string().min(1),
              feedback: z.string().min(1),
              recommended: z.boolean().optional(),
            }),
          )
          .min(2),
      }),
    )
    .min(1),
  practice: z
    .object({
      title: z.string().min(1),
      sentence: z.string().min(1),
      listener: z.string().min(1),
      enableAudio: z.boolean(),
      completionMessage: z.string().min(1),
    })
    .optional(),
})
/** 친구와 대화하기: my line → the friend's answer, turn by turn (see conversation.ts). */
const ConversationStep = z.object({
  kind: z.literal('conversation'),
  label: z.string().min(1),
  skippable: z.boolean().optional(),
  ...conversationShape,
})
const NoteStep = z.object({
  kind: z.literal('note'),
  label: z.string().min(1),
  title: z.string().min(1),
  lines: z.array(z.string().min(1)).min(1),
})

export const EpisodeStepSchema = z.discriminatedUnion('kind', [
  ReflectStep,
  ChoiceStep,
  DialogueStep,
  PerspectiveSortStep,
  SequenceStep,
  NoteStep,
  EmotionBodyMatchStep,
  ExpressionChoiceStep,
  ConversationStep,
])
export type EpisodeStep = z.infer<typeof EpisodeStepSchema>
export type PerspectiveSortMissionData = z.infer<typeof PerspectiveSortStep>
export type SequenceMissionData = z.infer<typeof SequenceStep>
export type ConversationStepData = z.infer<typeof ConversationStep>
export type EmotionBodyMissionData = z.infer<typeof EmotionBodyMatchStep>
export type ExpressionChoiceMissionData = z.infer<typeof ExpressionChoiceStep>

export const StepEpisodeSchema = z
  .object({
    format: z.literal('steps'),
    id: z.string().regex(/^[ABCD]\d{2}$/),
    version: z.number().int().positive(),
    domainId: z.enum(['A', 'B', 'C', 'D']),
    title: z.string().min(1),
    /** Shown one sentence per line on the first screen. */
    situation: z.object({ sentences: z.array(z.string().min(1)).min(1), alt: z.string().min(1) }),
    steps: z.array(EpisodeStepSchema).min(1),
    takeaway: z.string().min(1),
    safetyNote: z.string().min(1),
    review: z.object({
      state: z.enum(['draft', 'reviewed', 'published', 'retired']),
      educatorSafetyNote: z.string().min(1).optional(),
      source: z.string().min(1).optional(),
    }),
  })
  .superRefine((episode, ctx) => {
    episode.steps.forEach((step, index) => {
      const issue = (message: string) =>
        ctx.addIssue({ code: 'custom', path: ['steps', index], message })
      if (step.kind === 'reflect' || step.kind === 'choice') {
        const ids = step.options.map((option) => option.id)
        if (new Set(ids).size !== ids.length) issue('Option IDs must be unique')
        if (step.kind === 'choice' && step.acceptedIds.some((id) => !ids.includes(id)))
          issue('Accepted option is missing')
      }
      if (step.kind === 'perspective_sort') {
        const people = step.characters.map((character) => character.id)
        if (step.cards.some((card) => !people.includes(card.characterId)))
          issue('Every card must belong to a listed character')
        if (new Set(step.cards.map((card) => card.id)).size !== step.cards.length)
          issue('Card IDs must be unique')
      }
      if (step.kind === 'conversation') conversationIssues(step).forEach(issue)
      if (
        step.kind === 'expression_choice' &&
        step.situations.some((situation) => !situation.choices.some((c) => c.recommended))
      )
        issue('Every situation needs a recommended choice')
      if (step.kind === 'expression_choice') {
        if (new Set(step.situations.map((s) => s.id)).size !== step.situations.length)
          issue('Situation IDs must be unique')
        for (const situation of step.situations)
          if (new Set(situation.choices.map((c) => c.id)).size !== situation.choices.length)
            issue('Expression choice IDs must be unique within a situation')
      }
      if (step.kind === 'sequence') {
        const ids = step.cards.map((card) => card.id)
        if (new Set(ids).size !== ids.length) issue('Card IDs must be unique')
        for (const order of step.acceptedOrders)
          if (
            order.length !== ids.length ||
            new Set(order).size !== ids.length ||
            order.some((id) => !ids.includes(id))
          )
            issue('Every order must use every card exactly once')
      }
    })
  })

export type StepEpisode = z.infer<typeof StepEpisodeSchema>
