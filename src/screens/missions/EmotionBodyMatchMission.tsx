import type { RefObject } from 'react'
import type { EmotionBodyMissionData } from '@/content/stepSchema'
import {
  emotionBodyFeedback,
  type EmotionBodyEvent,
  type EmotionBodyState,
} from '@/engine/stepGame'

/**
 * 감정과 신체 반응 연결하기: tap a feeling (left), then a body signal (right). A line joins
 * them and an explanation appears. No pair is marked wrong; links can be changed or cleared.
 */
export function EmotionBodyMatchMission({
  mission,
  state,
  dispatch,
  headingRef,
}: {
  mission: EmotionBodyMissionData
  state: EmotionBodyState
  dispatch: (event: EmotionBodyEvent) => void
  headingRef: RefObject<HTMLHeadingElement | null>
}) {
  const rows = Math.max(mission.emotions.length, mission.bodies.length)
  const rowY = (index: number) => ((index + 0.5) / rows) * 100
  const selected = mission.emotions.find((item) => item.id === state.selectedEmotionId)
  const last = state.links.find((link) => link.emotionId === state.lastEmotionId)
  const linkedBody = (emotionId: string) =>
    state.links.find((link) => link.emotionId === emotionId)?.bodyId
  const bodyText = (id: string) => mission.bodies.find((body) => body.id === id)?.text ?? ''

  return (
    <>
      <div className="garden-card garden-guide garden-sort-guide">
        <h1 ref={headingRef} tabIndex={-1}>
          {mission.title}
        </h1>
        <p>{mission.instruction}</p>
      </div>
      <div className="garden-match" style={{ gridTemplateRows: `repeat(${rows}, auto)` }}>
        <svg
          className="garden-match__lines"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          style={{ gridRow: `1 / span ${rows}` }}
        >
          {state.links.map((link) => {
            const from = mission.emotions.findIndex((item) => item.id === link.emotionId)
            const to = mission.bodies.findIndex((item) => item.id === link.bodyId)
            return (
              <line
                key={link.emotionId}
                x1="0"
                y1={rowY(from)}
                x2="100"
                y2={rowY(to)}
                vectorEffect="non-scaling-stroke"
                data-last={link.emotionId === state.lastEmotionId || undefined}
              />
            )
          })}
        </svg>
        {mission.emotions.map((emotion, index) => {
          const body = linkedBody(emotion.id)
          return (
            <button
              key={emotion.id}
              type="button"
              className="garden-sort-card garden-match__card"
              style={{ gridColumn: 1, gridRow: index + 1 }}
              aria-pressed={state.selectedEmotionId === emotion.id}
              aria-label={`${emotion.text}${body ? `, ${bodyText(body)}와 연결됨` : ''}`}
              onClick={() => dispatch({ type: 'selectEmotion', id: emotion.id })}
            >
              <span className="garden-sort-card__text">{emotion.text}</span>
            </button>
          )
        })}
        {mission.bodies.map((body, index) => (
          <button
            key={body.id}
            type="button"
            className="garden-sort-card garden-match__card"
            data-side="body"
            style={{ gridColumn: 3, gridRow: index + 1 }}
            disabled={!selected}
            onClick={() => dispatch({ type: 'selectBody', id: body.id })}
          >
            <span className="garden-sort-card__text">{body.text}</span>
          </button>
        ))}
      </div>
      <p className="garden-sort-status" role="status">
        {selected
          ? `“${selected.text}” 그때 몸은 어떨까요? 오른쪽 카드를 눌러요.`
          : state.links.length
            ? '다른 마음 카드도 연결해 볼 수 있어요.'
            : '왼쪽 마음 카드를 먼저 눌러요.'}
      </p>
      {last && (
        <p className="garden-card garden-message" role="status">
          {emotionBodyFeedback(mission, last.emotionId, last.bodyId)}
        </p>
      )}
      <div className="garden-help">
        <button
          type="button"
          aria-expanded={state.hintVisible}
          aria-controls="match-hint"
          onClick={() => dispatch({ type: 'toggleHint' })}
        >
          힌트 보기
        </button>
        <button
          type="button"
          disabled={state.links.length === 0}
          onClick={() => dispatch({ type: 'reset' })}
        >
          다시 해보기
        </button>
      </div>
      {state.hintVisible && (
        <p className="garden-note" id="match-hint">
          {mission.hint}
        </p>
      )}
    </>
  )
}
