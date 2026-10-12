import { describe, expect, it } from 'vitest'
import { getStepEpisode } from '@/content/episodes'
import { initialStepState, reduceChoice, stepDone } from '@/engine/stepGame'

const episode = getStepEpisode('B01')!
const step = episode.steps.find((s) => s.kind === 'choice')!
if (step.kind !== 'choice') throw new Error('B01 has no choice step')

describe('choice step: changing one’s mind', () => {
  it('a different pick after an accepted answer reopens the step until it is confirmed again', () => {
    let state = initialStepState(step)
    if (state.kind !== 'choice') throw new Error('wrong state')
    state = reduceChoice(state, { type: 'select', id: 'C' }, step)
    state = reduceChoice(state, { type: 'submit' }, step)
    expect(state).toMatchObject({ selectedId: 'C', submittedId: 'C', solved: true })
    expect(stepDone(state, step)).toBe(true)
    // Tapping the same card changes nothing.
    expect(reduceChoice(state, { type: 'select', id: 'C' }, step)).toBe(state)
    // Tapping another card keeps the screen open and asks for a new confirmation.
    state = reduceChoice(state, { type: 'select', id: 'B' }, step)
    expect(state).toMatchObject({ selectedId: 'B', submittedId: null, solved: false })
    expect(stepDone(state, step)).toBe(false)
    state = reduceChoice(state, { type: 'submit' }, step)
    expect(state).toMatchObject({ submittedId: 'B', solved: true })
  })

  it('a not-recommended pick still shows its feedback and can be changed', () => {
    let state = initialStepState(step)
    if (state.kind !== 'choice') throw new Error('wrong state')
    state = reduceChoice(state, { type: 'select', id: 'A' }, step)
    state = reduceChoice(state, { type: 'submit' }, step)
    expect(state).toMatchObject({
      submittedId: 'A',
      solved: false,
      hintVisible: Boolean(step.hint),
    })
    state = reduceChoice(state, { type: 'select', id: 'D' }, step)
    expect(state).toMatchObject({ selectedId: 'D', submittedId: null, solved: false })
  })
})
