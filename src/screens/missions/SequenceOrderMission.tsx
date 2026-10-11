import type { RefObject } from 'react'
import type { SequenceMissionData } from '@/content/stepSchema'
import type { SequenceEvent, SequenceState } from '@/engine/stepGame'

const marks = ['①', '②', '③', '④', '⑤', '⑥']

/**
 * 행동 순서 맞추기: tap cards in the order you would do them; tap a placed card to take it
 * back. A different order keeps the cards and opens the hint; nothing is timed.
 */
export function SequenceOrderMission({
  mission,
  state,
  dispatch,
  headingRef,
}: {
  mission: SequenceMissionData
  state: SequenceState
  dispatch: (event: SequenceEvent) => void
  headingRef: RefObject<HTMLHeadingElement | null>
}) {
  const solved = state.result === 'correct'
  const text = (id: string) => mission.cards.find((card) => card.id === id)?.text ?? ''
  const remaining = state.pool.filter((id) => !state.placed.includes(id))
  const full = state.placed.length === mission.cards.length

  return (
    <>
      <div className="garden-card garden-guide garden-sort-guide">
        <h1 ref={headingRef} tabIndex={-1}>
          {mission.title}
        </h1>
        <p>{mission.instruction}</p>
      </div>
      <ol className="garden-seq-slots" aria-label="고른 순서">
        {mission.cards.map((_, index) => {
          const id = state.placed[index]
          return (
            <li key={index} className="garden-seq-slot" data-filled={Boolean(id) || undefined}>
              <span className="garden-seq-slot__mark" aria-hidden="true">
                {marks[index]}
              </span>
              {id ? (
                <button
                  type="button"
                  className="garden-seq-slot__card"
                  disabled={solved}
                  onClick={() => dispatch({ type: 'remove', id })}
                  aria-label={`${index + 1}번째: ${text(id)}. 눌러서 빼기`}
                >
                  {text(id)}
                </button>
              ) : (
                <span className="garden-seq-slot__empty">{index + 1}번째 카드</span>
              )}
            </li>
          )
        })}
      </ol>
      <p className="garden-sort-status" role="status">
        {solved
          ? '알맞은 순서로 놓았어요!'
          : full
            ? '카드를 모두 놓았어요. 확인해 볼까요?'
            : `${state.placed.length + 1}번째로 할 일을 눌러요.`}
      </p>
      {remaining.length > 0 && (
        <div className="garden-sort-cards" role="group" aria-label="순서 카드">
          {remaining.map((id) => (
            <button
              key={id}
              type="button"
              className="garden-sort-card"
              disabled={solved}
              onClick={() => dispatch({ type: 'place', id })}
            >
              <span className="garden-sort-card__text">{text(id)}</span>
            </button>
          ))}
        </div>
      )}
      {state.result === 'wrong' && (
        <p role="status" className="garden-alert">
          {mission.retryFeedback}
        </p>
      )}
      {solved && <p className="garden-card garden-message">{mission.correctFeedback}</p>}
      {!solved && (
        <div className="garden-help">
          <button
            type="button"
            aria-expanded={state.hintVisible}
            aria-controls="seq-hint"
            onClick={() => dispatch({ type: 'toggleHint' })}
          >
            힌트 보기
          </button>
          <button
            type="button"
            disabled={state.placed.length === 0}
            onClick={() => dispatch({ type: 'reset' })}
          >
            다시 해보기
          </button>
        </div>
      )}
      {state.hintVisible && !solved && (
        <p className="garden-note" id="seq-hint">
          {mission.hint}
        </p>
      )}
      {!solved && (
        <button
          type="button"
          className="garden-cta"
          disabled={!full}
          onClick={() => dispatch({ type: 'check' })}
        >
          확인하기
          <span aria-hidden="true">›</span>
        </button>
      )}
    </>
  )
}
