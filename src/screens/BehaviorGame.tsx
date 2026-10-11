import { useEffect, useReducer, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { getBehaviorEpisode, getStepEpisode, type BehaviorEpisode } from '@/content/behaviorEpisode'
import { episodesFor, getEpisode } from '@/content/episodeIndex'
import { BehaviorSorting, SortingReview } from './BehaviorSorting'
import { Cta, EpisodeCompletion, SafetyPromise } from './gameParts'
import { completionStored } from '@/services/completionStored'
import { conversationDone, initialConversation } from '@/engine/conversation'
import { ConversationMission } from './missions/ConversationMission'
import { StepEpisodeGame } from './StepEpisodeGame'
import { ChoiceCard } from '@/design/ChoiceCard'
import { avatarArt, devkitArt, placeArt, sceneArt } from '@/design/devkitAssets'
import {
  clearGame,
  initialGameState,
  loadGame,
  reduceGame,
  saveGame,
  type GameState,
} from '@/engine/behaviorGame'
import { useMvpProgress } from '@/services/mvpProgress'
import { useProfile } from '@/services/profile'
import { useSettings } from '@/services/settings'
import type { OptionId } from '@/content/schema'

/** Top padding per screen, from the handoff layouts. */
const screenTop: Record<GameState['step'], number> = {
  choice: 14,
  choiceFeedback: 10,
  conversation: 14,
  sorting: 14,
  sortingFeedback: 18,
  complete: 10,
}

function ActivityStepper({ step, talk }: { step: GameState['step']; talk: boolean }) {
  const order: GameState['step'][] = [
    'choice',
    'choiceFeedback',
    ...(talk ? (['conversation'] as const) : []),
    'sorting',
    'sortingFeedback',
  ]
  const labels = [
    '상황',
    '행동 선택',
    '선택 확인',
    ...(talk ? ['친구와 대화'] : []),
    '좋은 행동 나누기',
    '돌아보기',
  ]
  // 상황 is part of the first screen, so the question screen already counts as step 2.
  const current = step === 'complete' ? labels.length : order.indexOf(step) + 2
  return (
    <div
      className="garden-steps"
      role="progressbar"
      aria-label={`활동 ${current}단계, 전체 ${labels.length}단계`}
      aria-valuemin={1}
      aria-valuemax={labels.length}
      aria-valuenow={current}
    >
      {labels.map((label, index) => (
        <span key={label} className={index < current ? 'is-done' : ''} aria-hidden="true">
          <span className="garden-steps__line" />
          <span className="garden-steps__dot" />
        </span>
      ))}
      <span className="sr-only">{labels[current - 1]}</span>
    </div>
  )
}

export function BehaviorGame() {
  const { episodeId = '' } = useParams()
  const episode = getBehaviorEpisode(episodeId)
  const stepEpisode = getStepEpisode(episodeId)
  const started = useSettings((state) => state.started)
  const avatarId = useProfile((state) => state.avatarId)
  if (!started || !avatarId) return <Navigate to="/" replace />
  if (stepEpisode) return <StepEpisodeGame key={stepEpisode.id} episode={stepEpisode} />
  if (!episode) return <Navigate to="/" replace />
  return <BehaviorGameInner key={episode.id} episode={episode} />
}

function BehaviorGameInner({ episode }: { episode: BehaviorEpisode }) {
  const navigate = useNavigate()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const loaded = useState(() => loadGame(episode))[0]
  const [state, dispatch] = useReducer(
    (current: GameState, event: Parameters<typeof reduceGame>[1]) =>
      reduceGame(current, event, episode),
    loaded.kind === 'valid' ? loaded.state : initialGameState(),
  )
  const [recoveryRequired, setRecoveryRequired] = useState(loaded.kind === 'invalid')
  const [saveFailed, setSaveFailed] = useState(false)
  const [progressSaved, setProgressSaved] = useState(true)
  const markCompleted = useMvpProgress((progress) => progress.markCompleted)
  const selectedChoice = episode.choice.choices.find(
    (choice) => choice.id === state.selectedChoiceId,
  )
  const modelChoice = episode.choice.choices.find(
    (choice) => choice.id === episode.choice.modelChoiceId,
  )
  const storyNo = String(
    episodesFor(episode.domainId).findIndex((item) => item.id === episode.id) + 1,
  ).padStart(2, '0')
  const listPath = `/area/${episode.domainId}`
  const avatarId = useProfile((profile) => profile.avatarId)
  const [talkBusy, setTalkBusy] = useState(false)
  const skillTag = getEpisode(episode.id)?.skillTag

  // Each screen starts at the top with its heading focused (handoff: 화면 전환 시 스크롤 맨 위로).
  useEffect(() => {
    if (recoveryRequired) return
    window.scrollTo({ top: 0 })
    headingRef.current?.focus({ preventScroll: true })
  }, [state.step, recoveryRequired])
  useEffect(() => {
    if (!recoveryRequired) setSaveFailed(!saveGame(episode, state))
  }, [episode, state, recoveryRequired])
  useEffect(() => {
    if (state.step !== 'complete' || !state.choiceOutcome || !state.sortOutcome) return
    markCompleted(episode.id)
    setProgressSaved(completionStored(episode.id))
  }, [state.step, state.choiceOutcome, state.sortOutcome, episode.id, markCompleted])

  if (recoveryRequired)
    return (
      <div className="garden-page">
        <main className="garden-column garden-stack" style={{ paddingTop: 48 }}>
          <div className="garden-card garden-learned">
            <h1 className="garden-complete-title">활동을 이어갈 수 없어요</h1>
            <p>저장된 내용이 달라졌어요. 이 활동을 처음부터 다시 시작할 수 있어요.</p>
          </div>
          <Cta
            onClick={() => {
              clearGame(episode.id)
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
          <ActivityStepper step={state.step} talk={Boolean(episode.conversation)} />
        </header>
        <div className="garden-subheader">
          <span className="garden-subheader__chip">
            이야기 {storyNo} · {episode.title}
          </span>
          {skillTag && <span className="garden-skill-tag">{skillTag}</span>}
        </div>

        <main
          className={`garden-stack${state.step === 'sorting' || state.step === 'sortingFeedback' ? ' garden-stack--roomy' : ''}`}
          style={{ paddingTop: screenTop[state.step] }}
        >
          {saveFailed && (
            <p role="status" className="garden-alert">
              이 기기에 활동을 저장할 수 없어요. 지금은 계속 연습할 수 있어요.
            </p>
          )}

          {state.step === 'choice' && (
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
                <div className="garden-card garden-guide">
                  <p>{episode.situation.text}</p>
                </div>
              </div>
              <h1 ref={headingRef} tabIndex={-1} className="garden-title">
                {episode.choice.prompt}
              </h1>
              <div role="radiogroup" aria-label="할 행동 고르기" className="garden-choices">
                {episode.choice.choices.map((choice) => (
                  <ChoiceCard
                    key={choice.id}
                    variant="garden"
                    id={choice.id as OptionId}
                    text={choice.text}
                    selected={state.selectedChoiceId === choice.id}
                    onSelect={(id) => dispatch({ type: 'selectChoice', id })}
                  />
                ))}
              </div>
              {state.choiceWrong && (
                <p role="status" className="garden-alert">
                  다시 한 번 생각해 볼까요?
                  {selectedChoice && <small>{selectedChoice.feedback}</small>}
                </p>
              )}
              <div className="garden-help">
                <button
                  type="button"
                  aria-expanded={state.hintVisible}
                  aria-controls="garden-hint"
                  onClick={() => dispatch({ type: 'toggleHint' })}
                >
                  <span aria-hidden="true">💡 </span>힌트 보기
                </button>
                <button
                  type="button"
                  aria-expanded={state.modelVisible}
                  aria-controls="garden-example"
                  onClick={() => dispatch({ type: 'toggleModel' })}
                >
                  <span aria-hidden="true">💬 </span>예시 보기
                </button>
              </div>
              {state.hintVisible && (
                <p id="garden-hint" className="garden-note">
                  {episode.choice.hint}
                </p>
              )}
              {state.modelVisible && modelChoice && (
                <p id="garden-example" className="garden-note">
                  “{modelChoice.text}”
                </p>
              )}
              <Cta
                disabled={!state.selectedChoiceId}
                onClick={() => dispatch({ type: 'submitChoice' })}
              >
                선택 확인하기
              </Cta>
              <SafetyPromise>{episode.safetyNote}</SafetyPromise>
            </>
          )}

          {state.step === 'choiceFeedback' && (
            <>
              <div className="garden-badge">
                <img src={devkitArt.haruCelebrate} alt="기뻐하는 친구" />
              </div>
              <div className="garden-celebrate">
                <span className="garden-celebrate__cheer">잘했어요!</span>
                <h1 ref={headingRef} tabIndex={-1}>
                  좋은 방법을 골랐어요
                </h1>
              </div>
              <p className="garden-card garden-message">{selectedChoice?.feedback}</p>
              <Cta onClick={() => dispatch({ type: 'next' })}>
                {episode.conversation ? '친구와 대화하기로' : '좋은 행동 나누기로'}
              </Cta>
              <button
                type="button"
                className="garden-finish__again garden-retry"
                onClick={() => dispatch({ type: 'back' })}
              >
                이전으로
              </button>
              <SafetyPromise>{episode.safetyNote}</SafetyPromise>
            </>
          )}

          {state.step === 'conversation' && episode.conversation && (
            <>
              <ConversationMission
                talk={episode.conversation}
                state={state.conversation ?? initialConversation()}
                dispatch={(event) =>
                  dispatch(event.type === 'say' ? event : { type: 'resetConversation' })
                }
                headingRef={headingRef}
                art={{
                  me: avatarArt[avatarId ?? 'sun'],
                  friend: avatarId === 'sky' ? avatarArt.leaf : avatarArt.sky,
                }}
                onBusyChange={setTalkBusy}
              />
              {talkBusy ? null : state.conversation &&
                conversationDone(state.conversation, episode.conversation) ? (
                <Cta onClick={() => dispatch({ type: 'next' })}>좋은 행동 나누기로</Cta>
              ) : (
                <button
                  type="button"
                  className="garden-finish__again garden-retry"
                  onClick={() => dispatch({ type: 'skipConversation' })}
                >
                  이 미션 건너뛰기
                </button>
              )}
              <button
                type="button"
                className="garden-finish__again garden-retry"
                onClick={() => dispatch({ type: 'back' })}
              >
                이전으로
              </button>
              <SafetyPromise>{episode.safetyNote}</SafetyPromise>
            </>
          )}

          {state.step === 'sorting' && (
            <>
              <BehaviorSorting
                episode={episode}
                state={state}
                dispatch={dispatch}
                headingRef={headingRef}
              />
              <button
                type="button"
                className="garden-finish__again garden-retry"
                onClick={() => dispatch({ type: 'back' })}
              >
                이전으로
              </button>
              <SafetyPromise>{episode.safetyNote}</SafetyPromise>
            </>
          )}

          {state.step === 'sortingFeedback' && (
            <>
              <div className="garden-celebrate">
                <span className="garden-celebrate__cheer">잘했어요!</span>
                <h1 ref={headingRef} tabIndex={-1}>
                  행동을 나눴어요
                </h1>
              </div>
              <SortingReview episode={episode} />
              <p className="garden-summary">{episode.sorting.feedback}</p>
              <Cta onClick={() => dispatch({ type: 'next' })}>오늘 배운 내용 보기</Cta>
              <button
                type="button"
                className="garden-finish__again garden-retry"
                onClick={() => dispatch({ type: 'resetSort' })}
              >
                다시 해보기
              </button>
              <button
                type="button"
                className="garden-finish__again garden-retry"
                onClick={() => dispatch({ type: 'back' })}
              >
                이전으로
              </button>
              <SafetyPromise>{episode.safetyNote}</SafetyPromise>
            </>
          )}

          {state.step === 'complete' && (
            <EpisodeCompletion
              takeaway={episode.takeaway}
              listPath={listPath}
              progressSaved={progressSaved}
              headingRef={headingRef}
              onRestart={() => {
                clearGame(episode.id)
                dispatch({ type: 'restart' })
              }}
            />
          )}
        </main>
      </div>
    </div>
  )
}
