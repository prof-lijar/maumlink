import { useEffect, useReducer, useRef, useState, type RefObject } from 'react'
import { useNavigate } from 'react-router'
import type { EpisodeStep, StepEpisode } from '@/content/stepSchema'
import { episodesFor, getEpisode } from '@/content/episodeIndex'
import type { OptionId } from '@/content/schema'
import { ChoiceCard } from '@/design/ChoiceCard'
import { KidBackIcon } from '@/design/icons'
import {
  conversationFaces,
  faceArt,
  sceneArt,
  scenePanels,
  scenePanelSrcSet,
  sceneSrcSet,
} from '@/design/devkitAssets'
import {
  clearStepGame,
  completionScreen,
  emotionBodyFeedback,
  initialStepGame,
  inspectStepGame,
  reduceChoice,
  reduceEmotionBody,
  reduceExpression,
  reduceSequence,
  saveStepGame,
  stepDone,
  type ChoiceEvent,
  type EmotionBodyEvent,
  type ExpressionEvent,
  type SequenceEvent,
  type StepGame,
} from '@/engine/stepGame'
import { reduceConversation, type ConversationEvent } from '@/engine/conversation'
import { useMvpProgress } from '@/services/mvpProgress'
import { VoiceTalk, type VoiceContext } from '@/voice'
import { useProfile } from '@/services/profile'
import { Cta, EpisodeCompletion, SafetyPromise, VoiceButton } from './gameParts'
import { useAutoRead, useReadAloud } from '@/services/useSpeak'
import { completionStored } from '@/services/completionStored'
import { ConversationMission } from './missions/ConversationMission'
import { DialogueLines } from './missions/DialogueLines'
import { EmotionBodyMatchMission } from './missions/EmotionBodyMatchMission'
import { ExpressionChoiceMission } from './missions/ExpressionChoiceMission'
import { SequenceOrderMission } from './missions/SequenceOrderMission'

type StepEvent =
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'skip' }
  | { type: 'restart' }
  | { type: 'reflect'; id: string }
  /** The child answered by voice (말로 이야기하기); reflect and choice steps accept it. */
  | { type: 'spoken'; text: string }
  | { type: 'choice'; event: ChoiceEvent }
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
    case 'spoken':
      return (state?.kind === 'reflect' || state?.kind === 'choice') && event.text.trim()
        ? replace({ ...state, spoken: event.text.trim() })
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
  const art = conversationFaces(avatarId)
  const labels = ['상황 보기', ...episode.steps.map((item) => item.label), '마무리']

  useEffect(() => {
    window.scrollTo({ top: 0 })
    headingRef.current?.focus({ preventScroll: true })
  }, [game.screen])
  // localStorage is the external system here; the state only mirrors whether the write worked.
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    setSaveFailed(!saveStepGame(episode, game))
  }, [episode, game])
  useEffect(() => {
    if (game.screen !== last) return
    markCompleted(episode.id)
    // oxlint-disable-next-line react/set-state-in-effect
    setProgressSaved(completionStored(episode.id))
  }, [game.screen, last, episode.id, markCompleted])

  const [talkBusy, setTalkBusy] = useState(false)
  const canNext = game.screen === 0 || (stepDone(game.steps[index], step) && !talkBusy)

  // 음성 읽어주기: the situation, then each step's prompt or instruction as it opens; the
  // conversation and completion screens read their own lines.
  const narration =
    game.screen === 0
      ? { text: episode.situation.sentences.join(' '), key: 'situation' }
      : game.screen < last && step
        ? stepNarration(step, game.steps[index])
        : { text: undefined, key: 'complete' }
  useAutoRead(narration.text, `${episode.id}:${game.screen}:${narration.key}`)

  return (
    <div className="garden-page">
      <div className="garden-column">
        <header className="garden-header">
          <button
            type="button"
            className="garden-round-button garden-back-button"
            aria-label="에피소드 목록으로 돌아가기"
            onClick={() => navigate(listPath)}
          >
            <KidBackIcon />
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
          <VoiceButton />
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
                <div
                  className="garden-scene__frame"
                  data-panels={scenePanels[episode.id]?.length}
                  role={scenePanels[episode.id] ? 'img' : undefined}
                  aria-label={scenePanels[episode.id] ? episode.situation.alt : undefined}
                >
                  {scenePanels[episode.id] ? (
                    scenePanels[episode.id]!.map((src, i) => (
                      <img
                        key={src}
                        src={src}
                        srcSet={scenePanelSrcSet(src)}
                        sizes="(min-width: 600px) 560px, 100vw"
                        alt=""
                        style={{ animationDelay: `${i * 0.5}s` }}
                      />
                    ))
                  ) : (
                    <img
                      src={sceneArt[episode.id]}
                      srcSet={sceneSrcSet(episode.id)}
                      sizes="(min-width: 600px) 560px, 100vw"
                      alt={episode.situation.alt}
                    />
                  )}
                  {episode.situation.bubbles && (
                    <div className="garden-scene__bubbles" aria-hidden="true">
                      {episode.situation.bubbles.map((bubble, i) => (
                        <span key={i} style={{ animationDelay: `${0.6 + i * 0.4}s` }}>
                          {bubble}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
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
              voiceContext={{
                story: episode.title,
                situation: episode.situation.sentences.join(' '),
              }}
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
  voiceContext,
}: {
  step: EpisodeStep
  game: StepGame
  index: number
  dispatch: (event: StepEvent) => void
  headingRef: RefObject<HTMLHeadingElement | null>
  art: { me: string; friend: string }
  onTalkBusy: (busy: boolean) => void
  /** Story title and situation for the optional 말로 이야기하기 reply (VoiceTalk). */
  voiceContext: VoiceContext
}) {
  const state = game.steps[index]
  const chip = <span className="garden-step-label">{step.label}</span>
  const readAloud = useReadAloud()
  const voiceTalk =
    step.kind === 'reflect' || step.kind === 'choice' ? (
      <VoiceTalk
        context={{
          ...voiceContext,
          prompt: step.prompt,
          options: step.options.map((option) => option.text),
        }}
        face={art.friend}
        onHeard={(text) => dispatch({ type: 'spoken', text })}
      />
    ) : null

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
              imageSrc={option.emotionId ? faceArt(option.emotionId) : undefined}
              selected={state.selectedId === option.id}
              onSelect={(id) => {
                // The pick, its explanation and the shared closing line, in reading order.
                readAloud([option.text, option.feedback, step.closing].filter(Boolean).join(' '))
                dispatch({ type: 'reflect', id })
              }}
            />
          ))}
        </div>
        {voiceTalk}
        {!picked && step.hint && (
          <p className="garden-reflect__hint">
            <span className="garden-chip">도움말</span> {step.hint}
          </p>
        )}
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
              onSelect={(id) => {
                readAloud(option.text)
                dispatch({ type: 'choice', event: { type: 'select', id } })
              }}
            />
          ))}
        </div>
        {voiceTalk}
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
        {!state.solved && (state.selectedId || !state.spoken) && (
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

  if (step.kind === 'sequence' && state?.kind === 'sequence')
    return (
      <SequenceOrderMission
        mission={step}
        state={state}
        dispatch={(event) => {
          if (event.type === 'place')
            readAloud(step.cards.find((card) => card.id === event.id)?.text)
          dispatch({ type: 'sequence', event })
        }}
        headingRef={headingRef}
      />
    )

  if (step.kind === 'emotion_body_match' && state?.kind === 'emotion_body_match')
    return (
      <EmotionBodyMatchMission
        mission={step}
        state={state}
        dispatch={(event) => {
          if (event.type === 'selectEmotion')
            readAloud(step.emotions.find((item) => item.id === event.id)?.text)
          else if (event.type === 'selectBody' && state.selectedEmotionId)
            readAloud(
              `${step.bodies.find((item) => item.id === event.id)?.text ?? ''} ${emotionBodyFeedback(step, state.selectedEmotionId, event.id)}`,
            )
          dispatch({ type: 'emotionBody', event })
        }}
        headingRef={headingRef}
      />
    )

  if (step.kind === 'conversation' && state?.kind === 'conversation')
    return (
      <ConversationMission
        talk={step}
        state={state}
        dispatch={(event) => {
          if (event.type === 'say')
            readAloud(
              step.turns[state.turn]?.options.find((option) => option.id === event.id)?.text,
            )
          dispatch({ type: 'conversation', event })
        }}
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
        dispatch={(event) => {
          if (event.type === 'pick') {
            const choice = step.situations[state.situationIndex]?.choices.find(
              (item) => item.id === event.id,
            )
            readAloud(choice && `${choice.text} ${choice.feedback}`)
          }
          dispatch({ type: 'expression', event })
        }}
        headingRef={headingRef}
        art={art}
      />
    )

  return null
}

/**
 * What a step reads aloud when it opens, and again when its result changes (a confirmed or
 * wrong answer, the next situation). Picks are read by the controls themselves.
 */
function stepNarration(
  step: EpisodeStep,
  state: StepGame['steps'][number] | undefined,
): { text: string | undefined; key: string } {
  switch (step.kind) {
    case 'reflect':
      return { text: step.prompt, key: 'reflect' }
    case 'choice': {
      const submitted =
        state?.kind === 'choice'
          ? step.options.find((option) => option.id === state.submittedId)
          : undefined
      if (submitted && state?.kind === 'choice')
        return {
          text: state.solved
            ? submitted.feedback
            : `다시 한 번 생각해 볼까요? ${submitted.feedback}`,
          key: `choice:${submitted.id}:${state.solved}`,
        }
      return { text: step.prompt, key: 'choice' }
    }
    case 'dialogue':
      return {
        text: `${step.lines.map((line) => line.text).join(' ')} ${step.message}`,
        key: 'dialogue',
      }
    case 'note':
      return { text: `${step.title} ${step.lines.join(' ')}`, key: 'note' }
    case 'sequence': {
      const result = state?.kind === 'sequence' ? state.result : null
      if (result === 'correct') return { text: step.correctFeedback, key: 'sequence:correct' }
      if (result === 'wrong' && state?.kind === 'sequence')
        return { text: step.retryFeedback, key: `sequence:wrong:${state.attempts}` }
      return { text: `${step.title} ${step.instruction}`, key: 'sequence' }
    }
    case 'emotion_body_match':
      return { text: `${step.title} ${step.instruction}`, key: 'match' }
    case 'expression_choice': {
      const index = state?.kind === 'expression_choice' ? state.situationIndex : 0
      const situation = step.situations[index]
      if (situation)
        return {
          text: `${step.title} ${situation.story.join(' ')} ${situation.question}`,
          key: `expression:${index}`,
        }
      return {
        text: step.practice
          ? `${step.practice.title} 소리 내어 따라 말해 보아요. 읽어 보기만 해도 괜찮아요.`
          : undefined,
        key: 'expression:practice',
      }
    }
    case 'conversation':
      return { text: undefined, key: 'conversation' }
  }
}
