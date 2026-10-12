/**
 * 말로 이야기하기: an optional way for the child to answer with their own voice. Collapsed to
 * one button until tapped; never required to finish a step. Hidden unless an adult switched
 * it on and the server has keys (useVoiceAvailable).
 */
import { useEffect, useRef, useState } from 'react'
import { devkitArt } from '@/design/devkitAssets'
import { sound } from '@/services/sound'
import { VOICE_ERRORS, VOICE_OPEN_LABEL, VOICE_STATUS } from './copy'
import { useVoiceAvailable } from './useVoiceAvailable'
import { useVoiceTurn } from './useVoiceTurn'
import type { VoiceContext } from './voiceApi'

interface VoiceTalkProps {
  context: VoiceContext
  /** The companion's face shown beside the reply. */
  face?: string
  className?: string
  /** Called once per turn with what the child said, so the screen can count it as an answer. */
  onHeard?: (transcript: string) => void
  /** Called once per turn when the reply has been played (or shown, when narration is off). */
  onDone?: (info: { played: boolean; reply: string }) => void
}

export function VoiceTalk(props: VoiceTalkProps) {
  const available = useVoiceAvailable()
  if (!available) return null
  return <VoiceTalkPanel {...props} />
}

export function VoiceTalkPanel({ context, face, className, onHeard, onDone }: VoiceTalkProps) {
  const [open, setOpen] = useState(false)
  const { state, start, stop, replay, reset } = useVoiceTurn(context)
  const heard = useRef(onHeard)
  const done = useRef(onDone)
  useEffect(() => {
    heard.current = onHeard
    done.current = onDone
  }, [onHeard, onDone])
  useEffect(() => {
    if (state.transcript) heard.current?.(state.transcript)
  }, [state.transcript])
  // Fires once when a turn reaches 'done' (not on 다시 듣기, which goes through 'speaking' again
  // but has no new transcript).
  const reported = useRef('')
  useEffect(() => {
    if (state.phase !== 'done' || reported.current === state.transcript) return
    reported.current = state.transcript
    done.current?.({ played: state.played, reply: state.reply })
  }, [state.phase, state.played, state.reply, state.transcript])
  const recording = state.phase === 'recording'
  const busy =
    state.phase === 'starting' || state.phase === 'thinking' || state.phase === 'speaking'

  if (!open) {
    return (
      <button
        type="button"
        className={['garden-voice-talk__open', className].filter(Boolean).join(' ')}
        onClick={() => {
          sound.play('tick')
          setOpen(true)
        }}
      >
        <img src={devkitArt.mic} alt="" width={400} height={400} decoding="async" />
        {VOICE_OPEN_LABEL}
      </button>
    )
  }

  const toggle = () => {
    sound.play('tick')
    if (recording) void stop()
    else void start()
  }

  return (
    <section
      className={['garden-card garden-voice-talk', className].filter(Boolean).join(' ')}
      aria-label="말로 이야기하기"
      data-phase={state.phase}
    >
      <div className="garden-voice-talk__head">
        <span className="garden-chip">말로 이야기하기</span>
        <button
          type="button"
          className="garden-voice-talk__close"
          onClick={() => {
            reset()
            setOpen(false)
          }}
        >
          닫기
        </button>
      </div>
      <button
        type="button"
        className="garden-mic"
        data-recording={recording}
        aria-pressed={recording}
        aria-label={recording ? '말하기 끝내기' : '말하기 시작'}
        disabled={busy}
        onClick={toggle}
        style={{ '--level': state.level } as React.CSSProperties}
      >
        <img src={devkitArt.mic} alt="" width={400} height={400} decoding="async" />
      </button>
      <p role="status" className="garden-voice-talk__status">
        {state.phase === 'error' && state.error
          ? VOICE_ERRORS[state.error]
          : VOICE_STATUS[state.phase]}
      </p>
      {state.transcript && (
        <div className="garden-voice-talk__said">
          <span className="garden-chip">내가 한 말</span>
          <p>{state.transcript}</p>
        </div>
      )}
      {state.reply && (
        <div className="garden-card garden-guide garden-voice-talk__reply">
          {face && (
            <span className="garden-face">
              <img src={face} alt="" />
            </span>
          )}
          <p>{state.reply}</p>
        </div>
      )}
      {(state.phase === 'done' || state.phase === 'error') && (
        <div className="garden-voice-talk__actions">
          {state.reply && (
            <button type="button" className="garden-finish__again" onClick={replay}>
              다시 듣기
            </button>
          )}
          <button type="button" className="garden-finish__again" onClick={() => void start()}>
            다시 말하기
          </button>
        </div>
      )}
    </section>
  )
}
