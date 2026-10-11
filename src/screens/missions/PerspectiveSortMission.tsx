import type { RefObject } from 'react'
import type { PerspectiveSortMissionData } from '@/content/stepSchema'
import type { PerspectiveEvent, PerspectiveState } from '@/engine/stepGame'
import { DialogueLines, type SpeakerArt } from './DialogueLines'

/**
 * 나와 친구의 생각 구분하기: tap a thought card, then tap the person it belongs to.
 * Cards can move between people until the answer is checked; no dragging is required.
 */
export function PerspectiveSortMission({
  mission,
  state,
  dispatch,
  headingRef,
  art,
}: {
  mission: PerspectiveSortMissionData
  state: PerspectiveState
  dispatch: (event: PerspectiveEvent) => void
  headingRef: RefObject<HTMLHeadingElement | null>
  art: SpeakerArt
}) {
  const solved = state.result === 'correct'
  const selected = mission.cards.find((card) => card.id === state.selectedCardId)
  const unplaced = mission.cards.filter((card) => !state.placements[card.id])
  const placedCount = mission.cards.length - unplaced.length
  const cardButton = (card: PerspectiveSortMissionData['cards'][number]) => (
    <button
      key={card.id}
      type="button"
      className="garden-sort-card garden-persp-card"
      aria-pressed={state.selectedCardId === card.id}
      disabled={solved}
      onClick={() => dispatch({ type: 'selectCard', id: card.id })}
    >
      <span className="garden-sort-card__text">{card.text}</span>
      {state.selectedCardId === card.id && (
        <span className="garden-sort-card__label">선택한 카드</span>
      )}
    </button>
  )

  return (
    <>
      <div className="garden-card garden-guide garden-sort-guide">
        <h1 ref={headingRef} tabIndex={-1}>
          {mission.title}
        </h1>
        <p>{mission.instruction}</p>
      </div>
      <div className="garden-persp-zones" role="group" aria-label="생각을 놓을 곳">
        {mission.characters.map((person) => {
          const cards = mission.cards.filter((card) => state.placements[card.id] === person.id)
          return (
            <div key={person.id} className="garden-persp-zone" data-person={person.id}>
              <button
                type="button"
                className="garden-persp-zone__target"
                disabled={!selected || solved}
                onClick={() => dispatch({ type: 'place', characterId: person.id })}
                aria-label={`${person.name}에 놓기`}
              >
                <img src={person.id === 'me' ? art.me : art.friend} alt="" />
                <strong>{person.name}</strong>
                <small>{cards.length}장</small>
              </button>
              {cards.map(cardButton)}
            </div>
          )
        })}
      </div>
      <p className="garden-sort-status" role="status">
        {solved
          ? '모두 알맞게 놓았어요!'
          : selected
            ? `“${selected.text}” 누구의 생각일까요?`
            : unplaced.length
              ? '생각 카드를 먼저 눌러요.'
              : '카드를 옮기려면 카드를 다시 눌러요.'}
      </p>
      {unplaced.length > 0 && (
        <div className="garden-sort-cards" role="group" aria-label="생각 카드">
          {unplaced.map(cardButton)}
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
            aria-controls="persp-hint"
            onClick={() => dispatch({ type: 'toggleHint' })}
          >
            힌트 보기
          </button>
          <button
            type="button"
            disabled={placedCount === 0}
            onClick={() => dispatch({ type: 'reset' })}
          >
            다시 해보기
          </button>
        </div>
      )}
      {state.hintVisible && !solved && (
        <div id="persp-hint" className="garden-hint-dialogue">
          <p className="garden-note">{mission.hint}</p>
          <DialogueLines lines={mission.hintLines} art={art} />
        </div>
      )}
      {!solved && (
        <button
          type="button"
          className="garden-cta"
          disabled={placedCount !== mission.cards.length}
          onClick={() => dispatch({ type: 'check' })}
        >
          확인하기
          <span aria-hidden="true">›</span>
        </button>
      )}
    </>
  )
}
