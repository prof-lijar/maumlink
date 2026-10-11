/** React bindings for the speech service: auto-read on screen entry + manual speak. */
import { useCallback, useEffect } from 'react'
import type { LString } from '@/content/schema'
import { resolveL } from '@/i18n/useT'
import { useSettings } from './settings'
import { speech } from './speech'
import { useSpeechStatus } from './useSpeechStatus'

export function useSpeak() {
  const locale = useSettings((s) => s.locale)
  const speakL = useCallback(
    (ls: LString | string) => {
      const text = typeof ls === 'string' ? ls : resolveL(ls, locale)
      const audioUrl = typeof ls === 'string' ? undefined : ls.audio?.[locale]
      return speech.speak({ text, locale, audioUrl })
    },
    [locale],
  )
  return { speak: speakL, cancel: () => speech.cancel(), supported: speech.isSupported() }
}

/**
 * Speaks `text` once when the component mounts (or when `key` changes) if the
 * auto-read setting is on. Cancels on unmount so navigation never overlaps voices.
 */
export function useAutoRead(text: string | undefined, key: string, audioUrl?: string): void {
  const autoRead = useSettings((s) => s.autoRead)
  const locale = useSettings((s) => s.locale)
  useEffect(() => {
    if (!autoRead || !text) return
    const request = { text, locale, audioUrl, automatic: true }
    void speech.speak(request)
    return () => speech.cancel(request)
  }, [autoRead, text, key, locale, audioUrl])
}

/**
 * Reads a child-visible phrase on request (an option the child just picked, a card placed).
 * Manual, so it does not wait for the browser's activation gate; muted narration is a no-op.
 */
export function useReadAloud(): (text: string | undefined) => void {
  const locale = useSettings((s) => s.locale)
  return useCallback(
    (text) => {
      if (!text?.trim()) return
      void speech.speak({ text, locale })
    },
    [locale],
  )
}

export function useSpeaking(): boolean {
  return useSpeechStatus().phase === 'speaking'
}
