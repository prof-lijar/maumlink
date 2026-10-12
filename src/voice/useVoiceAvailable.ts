import { useSettings } from '@/services/settings'
import { microphoneSupported } from './recorder'

/**
 * True when 말로 이야기하기 is on (the default) and this device has a microphone API. The
 * server's keys are not checked up front: if a turn cannot be answered, the panel explains
 * it in child words and the cards still work.
 */
export function useVoiceAvailable(): boolean {
  const enabled = useSettings((s) => s.voiceInput)
  return enabled && microphoneSupported()
}
