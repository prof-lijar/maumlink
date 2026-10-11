import { useEffect, useRef, type RefObject } from 'react'
import type { ExpressionChoiceMissionData } from '@/content/stepSchema'
import type { OptionId } from '@/content/schema'
import { ChoiceCard } from '@/design/ChoiceCard'
import { devkitArt } from '@/design/devkitAssets'
import type { ExpressionEvent, ExpressionState } from '@/engine/stepGame'
import { usePracticeVoice } from '@/services/practiceVoice'
import type { SpeakerArt } from './DialogueLines'

/**
 * 상황에 맞는 말 고르기: one or more linked situations, each with spoken choices and an
 * explanation for every choice, then an optional 말하기 연습. Listening is optional.
 */
export function ExpressionChoiceMission({
  mission,
  state,
  dispatch,
  headingRef,
  art,
}: {
  mission: ExpressionChoiceMissionData
  state: ExpressionState
  dispatch: (event: ExpressionEvent) => void
  headingRef: RefObject<HTMLHeadingElement | null>
  art: SpeakerArt
}) {
  const situation = mission.situations[state.situationIndex]
  const pick = situation?.choices.find((choice) => choice.id === state.picks[state.situationIndex])
  const voice = usePracticeVoice(!situation && Boolean(mission.practice))
  const firstRender = useRef(true)

  // Each situation and the practice screen start at the top with the heading focused.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    window.scrollTo({ top: 0 })
    headingRef.current?.focus({ preventScroll: true })
  }, [state.situationIndex, headingRef])

  if (!situation && mission.practice) {
    const practice = mission.practice
    return (
      <>
        <div className="garden-card garden-guide garden-sort-guide">
          <h1 ref={headingRef} tabIndex={-1}>
            {practice.title}
          </h1>
          <p>소리 내어 따라 말해 보아요. 읽어 보기만 해도 괜찮아요.</p>
        </div>
        <div className="garden-practice">
          <div className="garden-dialogue__line" data-speaker="me">
            <img src={art.me} alt="" />
            <p>
              <span className="sr-only">나: </span>
              {practice.sentence}
            </p>
          </div>
          <div className="garden-practice__listener">
            <img src={devkitArt.teacher} alt="" />
            <span>{practice.listener}</span>
          </div>
        </div>
        {practice.enableAudio && (
          <div className="garden-help">
            <button
              type="button"
              disabled={voice.speaking}
              onClick={() => {
                voice.play(practice.sentence)
                dispatch({ type: 'listened' })
              }}
            >
              <span aria-hidden="true">🔊 </span>문장 듣기
            </button>
            <button
              type="button"
              disabled={!state.listened || voice.speaking}
              onClick={() => voice.play(practice.sentence)}
            >
              다시 듣기
            </button>
          </div>
        )}
        {voice.unavailable && (
          <p role="status" className="garden-note">
            이 기기에서는 소리를 들을 수 없어요. 문장을 읽어 보아요.
          </p>
        )}
        {state.practiced ? (
          <p role="status" className="garden-card garden-message">
            {practice.completionMessage}
          </p>
        ) : (
          <button
            type="button"
            className="garden-cta garden-cta--soft"
            onClick={() => dispatch({ type: 'practiced' })}
          >
            연습했어요
            <span aria-hidden="true">✓</span>
          </button>
        )}
        <button
          type="button"
          className="garden-finish__again garden-retry"
          onClick={() => dispatch({ type: 'reset' })}
        >
          처음부터 다시 해보기
        </button>
      </>
    )
  }
  if (!situation) return null

  return (
    <>
      <div className="garden-card garden-guide garden-sort-guide">
        <h1 ref={headingRef} tabIndex={-1}>
          {mission.title}
        </h1>
        {situation.story.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
      <h2 className="garden-title">{situation.question}</h2>
      <div role="radiogroup" aria-label={situation.question} className="garden-choices">
        {situation.choices.map((choice) => (
          <ChoiceCard
            key={choice.id}
            variant="garden"
            id={choice.id as OptionId}
            text={choice.text}
            selected={pick?.id === choice.id}
            onSelect={(id) => dispatch({ type: 'pick', id })}
          />
        ))}
      </div>
      {pick && (
        <div role="status" className={`garden-card garden-message garden-reflect`}>
          <p>{pick.feedback}</p>
          {!pick.recommended && <p className="garden-reflect__closing">다른 말도 골라 볼까요?</p>}
        </div>
      )}
      {situation.hint && (
        <>
          <div className="garden-help garden-help--single">
            <button
              type="button"
              aria-expanded={state.hintVisible}
              aria-controls="expression-hint"
              onClick={() => dispatch({ type: 'toggleHint' })}
            >
              힌트 보기
            </button>
          </div>
          {state.hintVisible && (
            <p id="expression-hint" className="garden-note">
              {situation.hint}
            </p>
          )}
        </>
      )}
      {pick && (state.situationIndex < mission.situations.length - 1 || mission.practice) && (
        <button
          type="button"
          className="garden-cta"
          onClick={() => dispatch({ type: 'nextSituation' })}
        >
          {state.situationIndex < mission.situations.length - 1
            ? '다음 상황 보기'
            : '말하기 연습하기'}
          <span aria-hidden="true">›</span>
        </button>
      )}
      {(state.situationIndex > 0 || pick) && (
        <button
          type="button"
          className="garden-finish__again garden-retry"
          onClick={() => dispatch({ type: 'reset' })}
        >
          처음부터 다시 해보기
        </button>
      )}
    </>
  )
}
