/**
 * One spoken exchange as a small state machine: record → send → play the reply.
 * Reusable by any screen; VoiceTalk is the stock UI on top of it.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSettings } from '@/services/settings'
import { speech } from '@/services/speech'
import { startRecording, VoiceError, type Recorder, type VoiceErrorCode } from './recorder'
import { runVoiceTurn, type VoiceContext } from './voiceApi'

export type VoicePhase =
  'idle' | 'starting' | 'recording' | 'thinking' | 'speaking' | 'done' | 'error'

export interface VoiceTurnState {
  phase: VoicePhase
  /** What the child said, as the STT heard it. */
  transcript: string
  reply: string
  error?: VoiceErrorCode
  /** 0–1 microphone level while recording, for the indicator. */
  level: number
}

const initial: VoiceTurnState = { phase: 'idle', transcript: '', reply: '', level: 0 }

export function useVoiceTurn(context: VoiceContext) {
  const locale = useSettings((s) => s.locale)
  const [state, setState] = useState<VoiceTurnState>(initial)
  const recorder = useRef<Recorder | null>(null)
  /** Pending microphone start, so a stop tapped before the mic is ready still ends the turn. */
  const starting = useRef<Promise<void> | null>(null)
  const session = useRef(0)
  const abort = useRef<AbortController | null>(null)
  const audioUrl = useRef<string | undefined>(undefined)
  const contextRef = useRef(context)
  useEffect(() => {
    contextRef.current = context
  }, [context])

  const dropAudio = () => {
    if (audioUrl.current) URL.revokeObjectURL(audioUrl.current)
    audioUrl.current = undefined
  }

  const play = useCallback(
    async (reply: string) => {
      setState((s) => ({ ...s, phase: 'speaking' }))
      await speech.speak({ text: reply, locale, audioUrl: audioUrl.current })
      setState((s) => (s.phase === 'speaking' ? { ...s, phase: 'done' } : s))
    },
    [locale],
  )

  const stop = useCallback(async () => {
    if (starting.current) await starting.current
    const current = recorder.current
    if (!current) return
    recorder.current = null
    setState((s) => ({ ...s, phase: 'thinking', level: 0 }))
    const controller = new AbortController()
    abort.current = controller
    try {
      const recording = await current.stop()
      const result = await runVoiceTurn(recording, contextRef.current, controller.signal)
      if (controller.signal.aborted) return
      dropAudio()
      audioUrl.current = result.audioUrl
      setState((s) => ({ ...s, transcript: result.transcript, reply: result.reply }))
      if (result.reply) await play(result.reply)
      else setState((s) => ({ ...s, phase: 'done' }))
    } catch (error) {
      if (controller.signal.aborted) return
      const code: VoiceErrorCode = error instanceof VoiceError ? error.code : 'server'
      const heard = error instanceof VoiceError ? error.transcript : undefined
      setState((s) => ({ ...s, phase: 'error', error: code, transcript: heard ?? s.transcript }))
    }
  }, [play])

  const start = useCallback(async () => {
    speech.cancel()
    abort.current?.abort()
    dropAudio()
    const id = (session.current += 1)
    setState({ ...initial, phase: 'starting' })
    const pending = startRecording({
      onLevel: (level) => setState((s) => (s.phase === 'recording' ? { ...s, level } : s)),
      onAutoStop: () => void stop(),
    })
      .then((started) => {
        // Reset or unmount while the mic was opening: release it instead of recording.
        if (session.current !== id) {
          started.cancel()
          return
        }
        recorder.current = started
        setState((s) => (s.phase === 'starting' ? { ...s, phase: 'recording' } : s))
      })
      .catch((error: unknown) => {
        if (session.current !== id) return
        const code: VoiceErrorCode = error instanceof VoiceError ? error.code : 'mic-unavailable'
        setState({ ...initial, phase: 'error', error: code })
      })
      .finally(() => {
        if (starting.current === pending) starting.current = null
      })
    starting.current = pending
    await pending
  }, [stop])

  const replay = useCallback(() => {
    if (state.reply) void play(state.reply)
  }, [play, state.reply])

  const reset = useCallback(() => {
    session.current += 1
    recorder.current?.cancel()
    recorder.current = null
    abort.current?.abort()
    speech.cancel()
    dropAudio()
    setState(initial)
  }, [])

  useEffect(
    () => () => {
      session.current += 1
      recorder.current?.cancel()
      abort.current?.abort()
      dropAudio()
    },
    [],
  )

  return { state, start, stop, replay, reset }
}
