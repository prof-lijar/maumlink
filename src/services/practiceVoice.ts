/**
 * Plays a practice sentence on request (말하기 연습). The life-garden screens have no voice
 * toggle, so an explicit tap turns narration on for that sentence. Recorded clips are used
 * when one exists; otherwise browser speech synthesis. When neither works (e.g. Android
 * WebView without speechSynthesis) the screen shows a note and the text alone is enough.
 */
import { useEffect, useRef, useState } from 'react'
import { useSettings } from './settings'
import { speech } from './speech'
import { useSpeechStatus } from './useSpeechStatus'

export function usePracticeVoice(active: boolean) {
  const status = useSpeechStatus()
  const [tried, setTried] = useState(false)
  const locale = useSettings((s) => s.locale)
  const request = useRef<Parameters<typeof speech.speak>[0] | null>(null)
  useEffect(() => {
    return () => {
      if (request.current) speech.cancel(request.current)
      request.current = null
    }
  }, [active])
  return {
    speaking: status.phase === 'speaking' || status.phase === 'loading',
    unavailable: !speech.isSupported() || (tried && status.phase === 'error'),
    play(text: string) {
      setTried(true)
      if (!useSettings.getState().voiceEnabled) useSettings.getState().setVoiceEnabled(true)
      speech.unlock()
      request.current = { text, locale }
      void speech.speak(request.current)
    },
  }
}
