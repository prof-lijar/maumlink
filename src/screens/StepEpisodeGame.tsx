import { useEffect, useReducer, useRef, useState, type RefObject } from 'react'
import { useNavigate } from 'react-router'
import type { EpisodeStep, StepEpisode } from '@/content/stepSchema'
import { episodesFor, getEpisode } from '@/content/episodeIndex'
import type { OptionId } from '@/content/schema'
import { ChoiceCard } from '@/design/ChoiceCard'
import { avatarArt, devkitArt, placeArt, sceneArt } from '@/design/devkitAssets'
import {
  clearStepGame,
  completionScreen,
  initialStepGame,
  inspectStepGame,
  reduceChoice,
  reduceEmotionBody,
  reduceExpression,
  reducePerspective,
  reduceSequence,
  saveStepGame,
  stepDone,
  type ChoiceEvent,
  type EmotionBodyEvent,
  type ExpressionEvent,
  type PerspectiveEvent,
  type SequenceEvent,
  type StepGame,
} from '@/engine/stepGame'
import { reduceConversation, type ConversationEvent } from '@/engine/conversation'
import { useMvpProgress } from '@/services/mvpProgress'
import { useProfile } from '@/services/profile'
import { Cta, EpisodeCompletion, SafetyPromise } from './gameParts'
import { completionStored } from '@/services/completionStored'
import { ConversationMission } from './missions/ConversationMission'
import { DialogueLines } from './missions/DialogueLines'
import { EmotionBodyMatchMission } from './missions/EmotionBodyMatchMission'
import { ExpressionChoiceMission } from './missions/ExpressionChoiceMission'
import { PerspectiveSortMission } from './missions/PerspectiveSortMission'
import { SequenceOrderMission } from './missions/SequenceOrderMission'

type StepEvent =
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'skip' }
  | { type: 'restart' }
  | { type: 'reflect'; id: string }
  | { type: 'choice'; event: ChoiceEvent }
  | { type: 'perspective'; event: PerspectiveEvent }
  | { type: 'sequence'; event: SequenceEvent }
  | { type: 'emotionBody'; event: EmotionBodyEvent }
  | { type: 'expression'; event: ExpressionEvent }
  | { type: 'conversation'; event: ConversationEvent }

/** Only the current step's state changes; earlier answers stay as they were. */
function reduceStepGame(game: StepGame, event: StepEvent, episode: StepEpisode): StepGame {
  const last = completionScreen(episode)
  const index = game.screen - 1
  const step = episode.steps[index]
  const state = game.steps[index]
  const replace = (next: StepGame['steps'][number]) => ({
    ...game,
    steps: game.steps.map((current, i) => (i === index ? next : current)),
  })
  switch (event.type) {
    case 'next':
      if (game.screen >= last || (game.screen > 0 && !stepDone(state, step))) return game
      return { ...game, screen: game.screen + 1 }
    case 'back':
      return game.screen > 0 && game.screen < last ? { ...game, screen: game.screen - 1 } : game
    case 'skip':
      // 상황별 미션은 건너뛰어도 이야기를 마칠 수 있다 (2026-10-10 사용자 요청).
      return step && 'skippable' in step && step.skippable && game.screen < last
        ? { ...game, screen: game.screen + 1 }
        : game
    case 'restart':
      return initialStepGame(episode)
    case 'reflect':
      return step?.kind === 'reflect' &&
        state?.kind === 'reflect' &&
        step.options.some((option) => option.id === event.id)
        ? replace({ ...state, selectedId: event.id })
        : game
    case 'choice':
      return step?.kind === 'choice' && state?.kind === 'choice'
        ? replace(reduceChoice(state, event.event, step))
        : game
    case 'perspective':
      return step?.kind === 'perspective_sort' && state?.kind === 'perspective_sort'
        ? replace(reducePerspective(state, event.event, step))
        : game
    case 'sequence':
      return step?.kind === 'sequence' && state?.kind === 'sequence'
        ? replace(reduceSequence(state, event.event, step))
        : game
    case 'emotionBody':
      return step?.kind === 'emotion_body_match' && state?.kind === 'emotion_body_match'
        ? replace(reduceEmotionBody(state, event.event, step))
        : game
    case 'conversation':
      return step?.kind === 'conversation' && state?.kind === 'conversation'
        ? replace(reduceConversation(state, event.event, step))
        : game
    case 'expression':
      return step?.kind === 'expression_choice' && state?.kind === 'expression_choice'
        ? replace(reduceExpression(state, event.event, step))
        : game
  }
}

export function StepEpisodeGame({ episode }: { episode: StepEpisode }) {
  const navigate = useNavigate()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const avatarId = useProfile((state) => state.avatarId)
  const markCompleted = useMvpProgress((progress) => progress.markCompleted)
  const [loaded] = useState(() => inspectStepGame(episode))
  const [recoveryRequired, setRecoveryRequired] = useState(loaded.kind === 'invalid')
  const [game, dispatch] = useReducer(
    (current: StepGame, event: StepEvent) => reduceStepGame(current, event, episode),
    loaded.kind === 'valid' ? loaded.state : initialStepGame(episode),
  )
  const [saveFailed, setSaveFailed] = useState(false)
  const [progressSaved, setProgressSaved] = useState(true)
  const last = completionScreen(episode)
  const index = game.screen - 1
  const step = episode.steps[index]
  const listPath = `/area/${episode.domainId}`
  const entry = getEpisode(episode.id)
  const storyNo = String(
    episodesFor(episode.domainId).findIndex((item) => item.id === episode.id) + 1,
  ).padStart(2, '0')
  const art = {
    me: avatarArt[avatarId ?? 'sun'],
    friend: avatarId === 'sky' ? avatarArt.leaf : avatarArt.sky,
  }
  const labels = ['상황 보기', ...episode.steps.map((item) => item.label), '마무리']

  useEffect(() => {
    window.scrollTo({ top: 0 })
    headingRef.current?.focus({ preventScroll: true })
  }, [game.screen, recoveryRequired])
  useEffect(() => {
    if (!recoveryRequired) setSaveFailed(!saveStepGame(episode, game))
  }, [episode, game, recoveryRequired])
  useEffect(() => {
    if (recoveryRequired || game.screen !== last) return
    markCompleted(episode.id)
    setProgressSaved(completionStored(episode.id))
  }, [game.screen, last, episode.id, markCompleted, recoveryRequired])

  const [talkBusy, setTalkBusy] = useState(false)
  const canNext = game.screen === 0 || (stepDone(game.steps[index], step) && !talkBusy)

  if (recoveryRequired)
    return (
      <div className="garden-page">
        <main className="garden-column garden-stack" style={{ paddingTop: 48 }}>
          <div className="garden-card garden-learned">
            <h1 ref={headingRef} tabIndex={-1} className="garden-complete-title">
              활동을 이어갈 수 없어요
            </h1>
            <p>저장된 내용이 달라졌어요. 이 활동을 처음부터 다시 시작할 수 있어요.</p>
          </div>
          <Cta
            onClick={() => {
              clearStepGame(episode.id)
              dispatch({ type: 'restart' })
              setRecoveryRequired(false)
            }}
          >
            처음부터 시작하기
          </Cta>
          <button type="button" className="garden-finish__again" onClick={() => navigate(listPath)}>
            목록으로 돌아가기
          </button>
        </main>
      </div>
    )

  return (
    <div className="garden-page">
      <div className="garden-column">
        <header className="garden-header">
          <button
            type="button"
            className="garden-round-button"
            aria-label="에피소드 목록으로 돌아가기"
            onClick={() => navigate(listPath)}
          >
            ←
          </button>
          <div
            className="garden-steps"
            role="progressbar"
            aria-label={`활동 ${game.screen + 1}단계, 전체 ${labels.length}단계`}
            aria-valuemin={1}
            aria-valuemax={labels.length}
            aria-valuenow={game.screen + 1}
          >
            {labels.map((_, i) => (
              <span key={i} className={i <= game.screen ? 'is-done' : ''} aria-hidden="true">
                <span className="garden-steps__line" />
                <span className="garden-steps__dot" />
              </span>
            ))}
            <span className="sr-only">{labels[game.screen]}</span>
          </div>
        </header>
        <div className="garden-subheader">
          <span className="garden-subheader__chip">
            이야기 {storyNo} · {episode.title}
          </span>
          {entry?.skillTag && <span className="garden-skill-tag">{entry.skillTag}</span>}
        </div>

        <main className="garden-stack garden-stack--roomy" style={{ paddingTop: 14 }}>
          {saveFailed && (
            <p role="status" className="garden-alert">
              이 기기에 활동을 저장할 수 없어요. 지금은 계속 연습할 수 있어요.
            </p>
          )}

          {game.screen === 0 && (
            <>
              <div className="garden-scene">
                {sceneArt[episode.id] ? (
                  <div className="garden-scene__frame">
                    <img src={sceneArt[episode.id]} alt={episode.situation.alt} />
                  </div>
                ) : (
                  <div
                    className="garden-scene__frame garden-scene__frame--composed"
                    role="img"
                    aria-label={episode.situation.alt}
                  >
                    <img src={placeArt[episode.domainId]} alt="" />
                    <img src={devkitArt.haruThinking} alt="" />
                  </div>
                )}
                <div className="garden-card garden-guide garden-story">
                  {episode.situation.sentences.map((sentence, i) => (
                    <p key={i} style={{ animationDelay: `${i * 0.35}s` }}>
                      {sentence}
                    </p>
                  ))}
                </div>
              </div>
              <h1 ref={headingRef} tabIndex={-1} className="garden-title">
                상황을 살펴봐요
              </h1>
            </>
          )}

          {step && game.screen < last && (
            <StepBody
              step={step}
              game={game}
              index={index}
              dispatch={dispatch}
              headingRef={headingRef}
              art={art}
              onTalkBusy={setTalkBusy}
            />
          )}

          {game.screen < last && (
            <>
              {canNext && (
                <Cta onClick={() => dispatch({ type: 'next' })}>
                  {step?.kind === 'emotion_body_match'
                    ? '완료하기'
                    : game.screen === last - 1
                      ? '마무리하기'
                      : '다음'}
                </Cta>
              )}
              {!canNext && step && 'skippable' in step && step.skippable && (
                <button
                  type="button"
                  className="garden-finish__again garden-retry"
                  onClick={() => dispatch({ type: 'skip' })}
                >
                  이 미션 건너뛰기
                </button>
              )}
              {game.screen > 0 && (
                <button
                  type="button"
                  className="garden-finish__again garden-retry"
                  onClick={() => dispatch({ type: 'back' })}
                >
                  이전으로
                </button>
              )}
              <SafetyPromise>{episode.safetyNote}</SafetyPromise>
            </>
          )}

          {game.screen === last && (
            <EpisodeCompletion
              takeaway={episode.takeaway}
              listPath={listPath}
              progressSaved={progressSaved}
              headingRef={headingRef}
              onRestart={() => {
                clearStepGame(episode.id)
                dispatch({ type: 'restart' })
              }}
            />
          )}
        </main>
      </div>
    </div>
  )
}

function StepBody({
  step,
  game,
  index,
  dispatch,
  headingRef,
  art,
  onTalkBusy,
}: {
  step: EpisodeStep
  game: StepGame
  index: number
  dispatch: (event: StepEvent) => void
  headingRef: RefObject<HTMLHeadingElement | null>
  art: { me: string; friend: string }
  onTalkBusy: (busy: boolean) => void
}) {
  const state = game.steps[index]
  const chip = <span className="garden-step-label">{step.label}</span>

  if (step.kind === 'reflect' && state?.kind === 'reflect') {
    const picked = step.options.find((option) => option.id === state.selectedId)
    return (
      <>
        {chip}
        <h1 ref={headingRef} tabIndex={-1} className="garden-title">
          {step.prompt}
        </h1>
        <div role="radiogroup" aria-label={step.label} className="garden-choices">
          {step.options.map((option) => (
            <ChoiceCard
              key={option.id}
              variant="garden"
              id={option.id as OptionId}
              text={option.text}
              selected={state.selectedId === option.id}
              onSelect={(id) => dispatch({ type: 'reflect', id })}
            />
          ))}
        </div>
        {picked && (
          <div role="status" className="garden-card garden-message garden-reflect">
            {picked.feedback && <p>{picked.feedback}</p>}
            <p className="garden-reflect__closing">{step.closing}</p>
          </div>
        )}
      </>
    )
  }

  if (step.kind === 'choice' && state?.kind === 'choice') {
    const submitted = step.options.find((option) => option.id === state.submittedId)
    return (
      <>
        {chip}
        <h1 ref={headingRef} tabIndex={-1} className="garden-title">
          {step.prompt}
        </h1>
        <div role="radiogroup" aria-label={step.label} className="garden-choices">
          {step.options.map((option) => (
            <ChoiceCard
              key={option.id}
              variant="garden"
              id={option.id as OptionId}
              text={option.text}
              selected={state.selectedId === option.id}
              onSelect={(id) => dispatch({ type: 'choice', event: { type: 'select', id } })}
            />
          ))}
        </div>
        {submitted && !state.solved && (
          <p role="status" className="garden-alert">
            다시 한 번 생각해 볼까요?
            <small>{submitted.feedback}</small>
          </p>
        )}
        {state.solved && submitted && (
          <p role="status" className="garden-card garden-message">
            {submitted.feedback}
          </p>
        )}
        {step.hint && !state.solved && (
          <div className="garden-help garden-help--single">
            <button
              type="button"
              aria-expanded={state.hintVisible}
              aria-controls={`step-hint-${index}`}
              onClick={() => dispatch({ type: 'choice', event: { type: 'toggleHint' } })}
            >
              <span aria-hidden="true">💡 </span>힌트 보기
            </button>
          </div>
        )}
        {step.hint && state.hintVisible && !state.solved && (
          <p id={`step-hint-${index}`} className="garden-note">
            {step.hint}
          </p>
        )}
        {!state.solved && (
          <Cta
            disabled={!state.selectedId}
            onClick={() => dispatch({ type: 'choice', event: { type: 'submit' } })}
          >
            선택 확인하기
          </Cta>
        )}
      </>
    )
  }

  if (step.kind === 'dialogue')
    return (
      <>
        {chip}
        <h1 ref={headingRef} tabIndex={-1} className="garden-title">
          {step.label}
        </h1>
        <DialogueLines lines={step.lines} art={art} />
        <p className="garden-card garden-message">{step.message}</p>
      </>
    )

  if (step.kind === 'note')
    return (
      <>
        {chip}
        <h1 ref={headingRef} tabIndex={-1} className="garden-title">
          {step.title}
        </h1>
        <div className="garden-card garden-message garden-reflect">
          {step.lines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </>
    )

  if (step.kind === 'perspective_sort' && state?.kind === 'perspective_sort')
    return (
      <PerspectiveSortMission
        mission={step}
        state={state}
        dispatch={(event) => dispatch({ type: 'perspective', event })}
        headingRef={headingRef}
        art={art}
      />
    )

  if (step.kind === 'sequence' && state?.kind === 'sequence')
    return (
      <SequenceOrderMission
        mission={step}
        state={state}
        dispatch={(event) => dispatch({ type: 'sequence', event })}
        headingRef={headingRef}
      />
    )

  if (step.kind === 'emotion_body_match' && state?.kind === 'emotion_body_match')
    return (
      <EmotionBodyMatchMission
        mission={step}
        state={state}
        dispatch={(event) => dispatch({ type: 'emotionBody', event })}
        headingRef={headingRef}
      />
    )

  if (step.kind === 'conversation' && state?.kind === 'conversation')
    return (
      <ConversationMission
        talk={step}
        state={state}
        dispatch={(event) => dispatch({ type: 'conversation', event })}
        headingRef={headingRef}
        art={art}
        onBusyChange={onTalkBusy}
      />
    )

  if (step.kind === 'expression_choice' && state?.kind === 'expression_choice')
    return (
      <ExpressionChoiceMission
        mission={step}
        state={state}
        dispatch={(event) => dispatch({ type: 'expression', event })}
        headingRef={headingRef}
        art={art}
      />
    )

  return null
}
