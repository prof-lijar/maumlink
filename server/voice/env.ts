/**
 * Server-side configuration for the optional voice feature. Keys live only in the server
 * environment (`.env.dev` locally via the Vite middleware, project settings on Vercel) and are
 * never sent to the browser.
 */
export type SttProvider = 'google' | 'elevenlabs'

export interface VoiceEnv {
  googleAiKey?: string
  googleAiModel: string
  /** Which speech-to-text to use: Gemini 3.5 Transcribe (default) or ElevenLabs Scribe. */
  sttProvider: SttProvider
  /** Key for Gemini 3.5 Transcribe; falls back to the AI key when GOOGLE_STT_API_KEY is empty. */
  googleSttKey?: string
  googleSttModel: string
  /** Gemini transcription mode: verbatim keeps the child's exact words; smart tidies them. */
  googleSttMode: 'verbatim' | 'smart'
  /** One ElevenLabs key serves both speech-to-text (Scribe) and text-to-speech. */
  elevenLabsKey?: string
  elevenLabsVoiceId: string
  elevenLabsModelId: string
  elevenLabsSttModel: string
  /** Ask Scribe for zero-retention processing; ElevenLabs allows it only on enterprise/trial tiers. */
  elevenLabsZeroRetention: boolean
  /** Origins allowed to call the API besides same-origin (the Capacitor WebView, local dev). */
  allowedOrigins: string[]
}

/** The shipped narration voice (Lulu Lolipop); the live reply uses the same voice id. */
export const DEFAULT_VOICE_ID = 'ocZQ262SsZb9RIxcQBOj'
export const DEFAULT_AI_MODEL = 'gemini-2.5-flash'
/** Recorded-audio sibling of gemini-3.5-transcribe-live; the live one needs a WebSocket stream. */
export const DEFAULT_GOOGLE_STT_MODEL = 'gemini-3.5-transcribe'
/** The recorded narration set was made with Eleven v4; the live reply uses the same model. */
export const DEFAULT_TTS_MODEL = 'eleven_v4'
export const DEFAULT_STT_MODEL = 'scribe_v2'
const DEFAULT_ORIGINS = [
  'https://localhost',
  'capacitor://localhost',
  'http://localhost:5173',
  'http://localhost:4173',
]

const clean = (value: string | undefined) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

/** Whether the configured speech-to-text provider has its key. */
export const sttConfigured = (env: VoiceEnv) =>
  env.sttProvider === 'google' ? Boolean(env.googleSttKey) : Boolean(env.elevenLabsKey)

export function readVoiceEnv(source: Record<string, string | undefined> = process.env): VoiceEnv {
  return {
    googleAiKey: clean(source.GOOGLE_AI_API_KEY) ?? clean(source.GOOGLE_API_KEY),
    googleAiModel: clean(source.GOOGLE_AI_MODEL) ?? DEFAULT_AI_MODEL,
    sttProvider:
      clean(source.VOICE_STT_PROVIDER)?.toLowerCase() === 'elevenlabs' ? 'elevenlabs' : 'google',
    googleSttKey:
      clean(source.GOOGLE_STT_API_KEY) ??
      clean(source.GOOGLE_AI_API_KEY) ??
      clean(source.GOOGLE_API_KEY),
    googleSttModel: clean(source.GOOGLE_STT_MODEL) ?? DEFAULT_GOOGLE_STT_MODEL,
    googleSttMode: clean(source.GOOGLE_STT_MODE)?.toLowerCase() === 'smart' ? 'smart' : 'verbatim',
    elevenLabsKey: clean(source.ELEVENLABS_API_KEY),
    elevenLabsVoiceId: clean(source.ELEVENLABS_VOICE_ID) ?? DEFAULT_VOICE_ID,
    elevenLabsModelId: clean(source.ELEVENLABS_MODEL_ID) ?? DEFAULT_TTS_MODEL,
    elevenLabsSttModel: clean(source.ELEVENLABS_STT_MODEL) ?? DEFAULT_STT_MODEL,
    elevenLabsZeroRetention: ['1', 'true', 'yes'].includes(
      (clean(source.ELEVENLABS_ZERO_RETENTION) ?? '').toLowerCase(),
    ),
    allowedOrigins: [
      ...DEFAULT_ORIGINS,
      ...(clean(source.VOICE_ALLOWED_ORIGINS)
        ?.split(',')
        .map((o) => o.trim()) ?? []),
    ].filter(Boolean),
  }
}
