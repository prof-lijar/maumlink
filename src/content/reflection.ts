import type { ReflectStepData, StepEpisode } from './stepSchema'
import type { StepGame } from '../engine/stepGame'

export function reflectionSelectionLine(
  summary: NonNullable<ReflectStepData['selectionSummary']>,
  choice: string,
): string {
  return summary.template.replace('{choice}', choice.replace(/[.!?。]+$/u, ''))
}

export function reflectionSummary(episode: StepEpisode, game: StepGame, index: number) {
  const step = episode.steps[index]
  if (step?.kind !== 'reflect' || !step.selectionSummary) return undefined
  const summary = step.selectionSummary
  const source = episode.steps[summary.fromStep]
  const state = game.steps[summary.fromStep]
  if (source?.kind !== 'reflect' || state?.kind !== 'reflect') return undefined
  const choice = source.options.find((option) => option.id === state.selectedId)
  // A spoken answer without a card pick must not be assigned an invented feeling.
  return choice
    ? { title: summary.title, selection: reflectionSelectionLine(summary, choice.text) }
    : undefined
}

export const reflectionChoiceText = (option: ReflectStepData['options'][number]) =>
  [option.emotionLabel, option.text].filter(Boolean).join(' ')

export const reflectionClosingText = (step: ReflectStepData) =>
  [step.closingTitle, step.closing].filter(Boolean).join(' ')
