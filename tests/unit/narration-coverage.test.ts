// @vitest-environment node
import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { StepEpisodeSchema } from '@/content/stepSchema'
import { resolveRecordedNarration } from '@/services/recordedNarration'
import { emotionBodyFeedback } from '@/engine/stepGame'
import { STORY_DIALOG_COPY } from '@/screens/storyDialogCopy'
import gameCopy from '../../content/game-copy.json'
import {
  reflectionChoiceText,
  reflectionClosingText,
  reflectionSelectionLine,
} from '@/content/reflection'
const missing: string[] = []
const check = (text: string | undefined, where: string) => {
  if (!text?.trim()) return
  if (!resolveRecordedNarration(text, 'ko')) missing.push(`${where}: ${text}`)
}
check(gameCopy.completionCheer, 'cheer')
for (const [m, c] of Object.entries(STORY_DIALOG_COPY)) check(`${c.title} ${c.body}`, `dialog.${m}`)
for (const file of readdirSync('content/episodes').filter((n) => n.endsWith('.json'))) {
  const e = StepEpisodeSchema.parse(JSON.parse(readFileSync(`content/episodes/${file}`, 'utf8')))
  check(e.situation.sentences.join(' '), `${e.id}.situation`)
  check(e.takeaway, `${e.id}.takeaway`)
  e.steps.forEach((step, i) => {
    const at = `${e.id}.${i}.${step.kind}`
    if (step.kind === 'reflect') {
      check(step.prompt, at)
      for (const o of step.options)
        check(
          [reflectionChoiceText(o), o.feedback, reflectionClosingText(step)]
            .filter(Boolean)
            .join(' '),
          `${at}.${o.id}`,
        )
      if (step.selectionSummary) {
        const summary = step.selectionSummary
        const source = e.steps[summary.fromStep]
        if (source?.kind === 'reflect')
          for (const choice of source.options) {
            const intro = `${summary.title} ${reflectionSelectionLine(summary, choice.text)}`
            check(`${step.prompt} ${intro}`, `${at}.summary.${choice.id}`)
            for (const option of step.options)
              check(
                [intro, reflectionChoiceText(option), option.feedback, reflectionClosingText(step)]
                  .filter(Boolean)
                  .join(' '),
                `${at}.summary.${choice.id}.${option.id}`,
              )
          }
      }
    }
    if (step.kind === 'choice') {
      check(step.prompt, at)
      for (const o of step.options) {
        check(o.text, `${at}.${o.id}`)
        check(o.feedback, `${at}.${o.id}.fb`)
        check(`다시 한 번 생각해 볼까요? ${o.feedback}`, `${at}.${o.id}.retry`)
      }
      check(step.hint, `${at}.hint`)
    }
    if (step.kind === 'dialogue')
      check(`${step.lines.map((l) => l.text).join(' ')} ${step.message}`, at)
    if (step.kind === 'note') check(`${step.title} ${step.lines.join(' ')}`, at)
    if (step.kind === 'sequence') {
      check(`${step.title} ${step.instruction}`, at)
      check(step.correctFeedback, `${at}.ok`)
      check(step.retryFeedback, `${at}.retry`)
      for (const c of step.cards) check(c.text, `${at}.card`)
    }
    if (step.kind === 'emotion_body_match') {
      check(`${step.title} ${step.instruction}`, at)
      for (const em of step.emotions) {
        check(em.text, `${at}.emotion`)
        for (const b of step.bodies)
          check(`${b.text} ${emotionBodyFeedback(step, em.id, b.id)}`, `${at}.${em.id}+${b.id}`)
      }
    }
    if (step.kind === 'conversation') {
      check(`${step.intro} ${step.turns[0]?.prompt ?? ''}`, at)
      step.turns.forEach((t, j) => {
        for (const l of t.options) {
          check(l.text, `${at}.${j}.${l.id}`)
          check(
            `${l.reply} ${step.turns[j + 1]?.prompt ?? step.closing}`,
            `${at}.${j}.${l.id}.reply`,
          )
          check(`${l.reply} ${t.prompt}`, `${at}.${j}.${l.id}.reply-retry`)
          check(l.tip, `${at}.${j}.${l.id}.tip`)
        }
      })
    }
    if (step.kind === 'expression_choice') {
      step.situations.forEach((s, j) => {
        check(`${step.title} ${s.story.join(' ')} ${s.question}`, `${at}.sit${j}`)
        for (const c of s.choices) check(`${c.text} ${c.feedback}`, `${at}.sit${j}.${c.id}`)
      })
      if (step.practice) {
        check(
          `${step.practice.title} 소리 내어 따라 말해 보아요. 읽어 보기만 해도 괜찮아요.`,
          `${at}.practice`,
        )
        check(step.practice.sentence, `${at}.practice.sentence`)
        check(step.practice.completionMessage, `${at}.practice.done`)
      }
    }
  })
}

/**
 * Every sentence a screen can read (including the ones composed at runtime) must resolve to
 * recorded clips, so children never hear the browser voice. When this fails: run
 * `pnpm narration:inventory`, `pnpm narration:generate:elevenlabs`, `pnpm narration:import`.
 */
describe('narration coverage', () => {
  it('has a recorded clip for every sentence the app reads', () => {
    expect(missing).toEqual([])
  })
})
