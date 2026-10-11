import { useEffect, useRef, useState, type RefObject } from 'react'
import type { ConversationData } from '@/content/conversation'
import type { ConversationEvent, ConversationState } from '@/engine/conversation'
import type { SpeakerArt } from './DialogueLines'

const isAction = (text: string) => text.startsWith('(') && text.endsWith(')')

/**
 * How long the friend "types" before a reply appears. Tests set it to 0, which shows the
 * reply at once (see tests/setup.ts).
 */
export const conversationTiming = { replyDelayMs: 1500 }

/**
 * 친구와 대화하기: a chat panel (friend on the left, me on the right) above my choices. After
 * the child says a line, the friend's bubble shows "입력 중…" for a moment, then the reply,
 * the tip and the next choices appear. Lines that did not go well can be retried at once.
 */
export function ConversationMission({
  talk,
  state,
  dispatch,
  headingRef,
  art,
  onBusyChange,
}: {
  talk: ConversationData
  state: ConversationState
  dispatch: (event: ConversationEvent) => void
  headingRef: RefObject<HTMLHeadingElement | null>
  art: SpeakerArt
  onBusyChange?: (busy: boolean) => void
}) {
  // Lines restored from a saved session are shown as already answered.
  const [answered, setAnswered] = useState(state.said.length)
  const typing = conversationTiming.replyDelayMs > 0 && answered < state.said.length
  const visible = typing ? state.said.length - 1 : state.said.length
  const done = state.turn >= talk.turns.length
  const turn = talk.turns[state.turn]
  const lineOf = (entry: ConversationState['said'][number]) =>
    talk.turns[entry.turn]?.options.find((option) => option.id === entry.id)
  const last = state.said.at(-1)
  const lastLine = last && lineOf(last)
  const logRef = useRef<HTMLOListElement>(null)
  const choicesRef = useRef<HTMLDivElement>(null)

  // A new line: wait, then reveal the friend's reply (a reset clears the log at once).
  useEffect(() => {
    if (state.said.length < answered) {
      setAnswered(state.said.length)
      return
    }
    if (!typing) return
    const timer = window.setTimeout(
      () => setAnswered(state.said.length),
      conversationTiming.replyDelayMs,
    )
    return () => window.clearTimeout(timer)
  }, [state.said.length, answered, typing])

  // Keep the newest bubble in view while typing, and the next choices once the reply is in.
  useEffect(() => {
    if (state.said.length === 0) return
    const target = typing ? logRef.current?.lastElementChild : choicesRef.current
    target?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' })
  }, [typing, state.said.length])

  // The screen around the mission hides its 다음 button until the reply has appeared.
  useEffect(() => onBusyChange?.(typing), [typing, onBusyChange])
  useEffect(() => () => onBusyChange?.(false), [onBusyChange])

  const bubble = (key: string, speaker: 'me' | 'friend', text: string) => (
    <li
      key={key}
      className="garden-dialogue__line"
      data-speaker={speaker}
      data-action={isAction(text) || undefined}
    >
      <img src={speaker === 'me' ? art.me : art.friend} alt="" />
      <p>
        <span className="sr-only">{speaker === 'me' ? '나: ' : `${talk.partner}: `}</span>
        {text}
      </p>
    </li>
  )

  return (
    <>
      <div className="garden-card garden-guide garden-sort-guide">
        <h1 ref={headingRef} tabIndex={-1}>
          {talk.title}
        </h1>
        <p>{talk.intro}</p>
      </div>
      <section className="garden-chat-panel" aria-label="대화창">
        <p className="garden-chat-panel__label" aria-hidden="true">
          <span>💬</span> 대화창
        </p>
        {state.said.length === 0 ? (
          <p className="garden-chat-panel__empty">아래에서 할 말을 골라 친구에게 말해 보세요.</p>
        ) : (
          <ol
            ref={logRef}
            className="garden-dialogue garden-chat"
            aria-label={`${talk.partner}와 나눈 대화`}
            aria-live="polite"
          >
            {state.said.map((entry, index) => {
              const line = lineOf(entry)
              if (!line) return null
              return [
                bubble(`${index}-me`, 'me', line.text),
                index < visible ? (
                  bubble(`${index}-friend`, 'friend', line.reply)
                ) : (
                  <li
                    key={`${index}-typing`}
                    className="garden-dialogue__line garden-chat__typing"
                    data-speaker="friend"
                  >
                    <img src={art.friend} alt="" />
                    <p>
                      <span className="sr-only">{talk.partner}가 답을 입력하고 있어요</span>
                      <span className="garden-chat__dots" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                      </span>
                    </p>
                  </li>
                ),
              ]
            })}
          </ol>
        )}
      </section>
      {!typing && lastLine && (
        <p
          role="status"
          className={`garden-card garden-chat__tip${lastLine.good ? '' : ' garden-chat__tip--retry'}`}
        >
          {lastLine.good && <strong>자신 있게 말했어요! </strong>}
          {lastLine.tip}
        </p>
      )}
      {!typing && done && <p className="garden-card garden-message">{talk.closing}</p>}
      {!typing && !done && turn && (
        <div ref={choicesRef} className="garden-chat__turn" role="group" aria-label={turn.prompt}>
          <p className="garden-chat__prompt">
            <span className="garden-step-label">내 차례</span> {turn.prompt}
          </p>
          {turn.options.map((option) => (
            <button
              key={option.id}
              type="button"
              className="garden-sort-card garden-chat__option"
              data-action={isAction(option.text) || undefined}
              onClick={() => dispatch({ type: 'say', id: option.id })}
            >
              <span className="garden-sort-card__text">{option.text}</span>
            </button>
          ))}
        </div>
      )}
      {!typing && state.said.length > 0 && (
        <button
          type="button"
          className="garden-finish__again garden-retry"
          onClick={() => dispatch({ type: 'reset' })}
        >
          대화 처음부터 다시 하기
        </button>
      )}
    </>
  )
}
