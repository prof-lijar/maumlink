/** Child-facing wording of 말로 이야기하기 (draft, pending educator review). */
import type { VoiceErrorCode } from './recorder'
import type { VoicePhase } from './useVoiceTurn'

export const VOICE_OPEN_LABEL = '말로 이야기해 볼래요'
export const VOICE_STATUS: Record<VoicePhase, string> = {
  idle: '마이크를 누르고 내 마음을 말해 보아요.',
  starting: '마이크를 켜고 있어요…',
  recording: '듣고 있어요. 다 말했으면 마이크를 다시 눌러요.',
  thinking: '잠깐만요, 생각하고 있어요…',
  speaking: '대답을 들어 보아요.',
  done: '잘 들었어요! 또 말하고 싶으면 마이크를 눌러요.',
  error: '',
}
export const VOICE_ERRORS: Record<VoiceErrorCode, string> = {
  'mic-denied': '마이크를 쓸 수 없어요. 어른에게 마이크를 켜 달라고 해요.',
  'mic-unavailable': '이 기기에서는 마이크를 쓸 수 없어요.',
  offline: '지금은 인터넷에 연결되지 않았어요. 보기에서 골라도 괜찮아요.',
  'nothing-heard': '잘 들리지 않았어요. 마이크 가까이에서 다시 말해 볼까요?',
  server: '지금은 대답을 들을 수 없어요. 보기에서 골라도 괜찮아요.',
}
