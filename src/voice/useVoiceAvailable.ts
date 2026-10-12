import { useEffect, useState } from 'react'
import { useSettings } from '@/services/settings'
import { microphoneSupported } from './recorder'
import { voiceHealth } from './voiceApi'

/**
 * True when an adult switched 말로 이야기하기 on, this device has a microphone API and the
 * server reports speech-to-text and AI keys. Text-to-speech is optional (browser voice fallback).
 */
export function useVoiceAvailable(): boolean {
  const enabled = useSettings((s) => s.voiceInput)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!enabled || !microphoneSupported()) {
      // oxlint-disable-next-line react/set-state-in-effect
      setReady(false)
      return
    }
    let active = true
    void voiceHealth().then((health) => {
      if (active) setReady(Boolean(health?.stt && health.ai))
    })
    return () => {
      active = false
    }
  }, [enabled])
  return enabled && ready
}
