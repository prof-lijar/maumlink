/**
 * Browser client for the voice API (server/voice/router.ts). Same-origin `/api/voice` by
 * default; the Android build sets `VITE_VOICE_API_BASE` to the deployed site.
 */
import { VoiceError, type Recording } from './recorder'

const configuredBase = (import.meta.env.VITE_VOICE_API_BASE as string | undefined)?.trim()
export const VOICE_API_BASE = configuredBase ? configuredBase.replace(/\/$/, '') : '/api/voice'

export interface VoiceContext {
  story?: string
  situation?: string
  prompt?: string
  options?: string[]
}
export interface VoiceHealth {
  stt: boolean
  ai: boolean
  tts: boolean
}
export interface VoiceTurnResult {
  transcript: string
  reply: string
  /** Object URL of the spoken reply (audio/mpeg) when ElevenLabs produced one. */
  audioUrl?: string
}

let healthPromise: Promise<VoiceHealth | null> | undefined

/** Which providers the server has keys for; `null` when the API is unreachable. Cached. */
export function voiceHealth(force = false): Promise<VoiceHealth | null> {
  if (!healthPromise || force) {
    healthPromise = fetch(`${VOICE_API_BASE}/health`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) return null
        const data = (await response.json()) as Partial<VoiceHealth>
        return { stt: Boolean(data.stt), ai: Boolean(data.ai), tts: Boolean(data.tts) }
      })
      .catch(() => null)
  }
  return healthPromise
}
export function resetVoiceHealth(): void {
  healthPromise = undefined
}

async function post<T>(action: string, body: unknown, signal?: AbortSignal): Promise<T> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false)
    throw new VoiceError('offline')
  let response: Response
  try {
    response = await fetch(`${VOICE_API_BASE}/${action}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new VoiceError('offline')
  }
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new VoiceError('server', `${action} ${response.status} ${detail.slice(0, 200)}`)
  }
  return response.json() as Promise<T>
}

export const transcribe = (recording: Recording, signal?: AbortSignal) =>
  post<{ transcript: string; confidence: number }>(
    'transcribe',
    { audio: recording.audio, sampleRate: recording.sampleRate },
    signal,
  )

export const respond = (text: string, context: VoiceContext, signal?: AbortSignal) =>
  post<{ reply: string }>('respond', { text, context }, signal)

/** The reply as an audio/mpeg blob URL in the narration voice; the caller revokes it. */
export async function speak(text: string, signal?: AbortSignal): Promise<string> {
  const response = await fetch(`${VOICE_API_BASE}/speak`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text }),
    signal,
  })
  if (!response.ok) throw new VoiceError('server', `speak ${response.status}`)
  return URL.createObjectURL(await response.blob())
}

const base64ToBlobUrl = (base64: string, type: string) => {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return URL.createObjectURL(new Blob([bytes], { type }))
}

export interface WrapupInput {
  story?: string
  situation?: string
  takeaway: string
  turns: Array<{ prompt?: string; said: string }>
}

/** A personal wrap-up built from what the child said, ending with the reviewed takeaway. */
export async function requestWrapup(
  input: WrapupInput,
  signal?: AbortSignal,
): Promise<{ text: string; audioUrl?: string }> {
  const data = await post<{ text?: string; audio?: string }>('wrapup', input, signal)
  const text = data.text?.trim() ?? ''
  if (!text) throw new VoiceError('server', 'wrapup: empty')
  return { text, audioUrl: data.audio ? base64ToBlobUrl(data.audio, 'audio/mpeg') : undefined }
}

/** One round trip: transcribe → reply → (best-effort) speech. */
export async function runVoiceTurn(
  recording: Recording,
  context: VoiceContext,
  signal?: AbortSignal,
): Promise<VoiceTurnResult> {
  const data = await post<{
    transcript?: string
    reply?: string
    audio?: string
    error?: string
    provider?: string
  }>('turn', { audio: recording.audio, sampleRate: recording.sampleRate, context }, signal)
  const transcript = data.transcript?.trim() ?? ''
  if (!transcript) throw new VoiceError('nothing-heard')
  if (data.error)
    throw new VoiceError('server', `${data.provider ?? 'turn'}: ${data.error}`, transcript)
  return {
    transcript,
    reply: data.reply?.trim() ?? '',
    audioUrl: data.audio ? base64ToBlobUrl(data.audio, 'audio/mpeg') : undefined,
  }
}
