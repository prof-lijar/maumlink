/**
 * The voice API as one framework-free function `Request → Response`, so the same code runs
 * as a Vercel Function (api/voice/[action].ts), inside the Vite dev/preview server
 * (scripts/voice-dev-server.ts) and in unit tests.
 *
 *   GET  /api/voice/health      → which providers are configured
 *   POST /api/voice/transcribe  { audio, sampleRate }            → { transcript, confidence }  (ElevenLabs Scribe)
 *   POST /api/voice/respond     { text, context }                → { reply }
 *   POST /api/voice/speak       { text }                         → audio/mpeg  (ElevenLabs TTS)
 *   POST /api/voice/turn        { audio, sampleRate, context }   → { transcript, reply, audio? }
 *
 * `audio` is a base64 16-bit mono PCM WAV (src/voice/wav.ts). Nothing is stored server-side.
 */
import { readVoiceEnv, type VoiceEnv } from './env'
import {
  generateReply,
  ProviderError,
  synthesizeSpeech,
  transcribeWav,
  type ReplyContext,
} from './providers'

export interface VoiceRouterOptions {
  env?: VoiceEnv
  fetcher?: typeof fetch
}

const MAX_AUDIO_BASE64 = 2_000_000 // ~1.5 MB of PCM ≈ 45 s at 16 kHz; the client stops at 15 s
const MAX_TEXT = 400
const ACTIONS = new Set(['health', 'transcribe', 'respond', 'speak', 'turn'])

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  })

function corsHeaders(request: Request, env: VoiceEnv): Record<string, string> | null {
  const origin = request.headers.get('origin')
  if (!origin) return {}
  let sameOrigin = false
  try {
    sameOrigin = new URL(request.url).origin === origin
  } catch {
    sameOrigin = false
  }
  if (!sameOrigin && !env.allowedOrigins.includes(origin)) return null
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    vary: 'origin',
  }
}

export function voiceAction(url: string): string | undefined {
  const match = /\/voice\/([a-z]+)\/?$/.exec(new URL(url, 'http://local').pathname)
  return match && ACTIONS.has(match[1]!) ? match[1] : undefined
}

const asText = (value: unknown) =>
  typeof value === 'string' ? value.trim().slice(0, MAX_TEXT) : ''
const asContext = (value: unknown): ReplyContext => {
  const c = (value ?? {}) as Record<string, unknown>
  return {
    story: asText(c.story) || undefined,
    situation: asText(c.situation) || undefined,
    prompt: asText(c.prompt) || undefined,
    options: Array.isArray(c.options)
      ? c.options.map(asText).filter(Boolean).slice(0, 8)
      : undefined,
  }
}
const asAudio = (body: Record<string, unknown>) => {
  const audio = typeof body.audio === 'string' ? body.audio : ''
  const sampleRate = Number(body.sampleRate) || 16000
  if (!audio) throw new HttpError(400, 'audio (base64 WAV) is required')
  if (audio.length > MAX_AUDIO_BASE64) throw new HttpError(413, 'audio is too long')
  if (sampleRate < 8000 || sampleRate > 48000) throw new HttpError(400, 'unsupported sampleRate')
  return { audio, sampleRate }
}

class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function handleVoiceRequest(
  request: Request,
  options: VoiceRouterOptions = {},
): Promise<Response> {
  const env = options.env ?? readVoiceEnv()
  const fetcher = options.fetcher ?? fetch
  const cors = corsHeaders(request, env)
  if (!cors) return json({ error: 'origin not allowed' }, 403)
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
  const action = voiceAction(request.url)
  if (!action) return json({ error: 'unknown voice action' }, 404, cors)

  try {
    if (action === 'health') {
      return json(
        {
          stt: Boolean(env.elevenLabsKey),
          ai: Boolean(env.googleAiKey),
          tts: Boolean(env.elevenLabsKey),
          model: env.googleAiModel,
          voiceId: env.elevenLabsVoiceId,
        },
        200,
        { ...cors, 'cache-control': 'no-store' },
      )
    }
    if (request.method !== 'POST') return json({ error: 'method not allowed' }, 405, cors)
    let body: Record<string, unknown>
    try {
      body = (await request.json()) as Record<string, unknown>
    } catch {
      throw new HttpError(400, 'body must be JSON')
    }

    if (action === 'transcribe') {
      const { audio, sampleRate } = asAudio(body)
      return json(await transcribeWav(env, audio, sampleRate, fetcher), 200, cors)
    }
    if (action === 'respond') {
      const text = asText(body.text)
      if (!text) throw new HttpError(400, 'text is required')
      const reply = await generateReply(env, text, asContext(body.context), fetcher)
      return json({ reply }, 200, cors)
    }
    if (action === 'speak') {
      const text = asText(body.text)
      if (!text) throw new HttpError(400, 'text is required')
      const audio = await synthesizeSpeech(env, text, fetcher)
      return new Response(audio, {
        status: 200,
        headers: { ...cors, 'content-type': 'audio/mpeg', 'cache-control': 'no-store' },
      })
    }
    // turn: the whole exchange in one round trip. TTS is best-effort: a missing ElevenLabs key
    // or a failed synthesis still returns the text so the browser voice can read it.
    const { audio, sampleRate } = asAudio(body)
    const heard = await transcribeWav(env, audio, sampleRate, fetcher)
    if (!heard.transcript) return json({ transcript: '', reply: '' }, 200, cors)
    const reply = await generateReply(env, heard.transcript, asContext(body.context), fetcher)
    let speech: string | undefined
    if (reply && env.elevenLabsKey) {
      try {
        speech = Buffer.from(await synthesizeSpeech(env, reply, fetcher)).toString('base64')
      } catch {
        speech = undefined
      }
    }
    return json(
      { transcript: heard.transcript, confidence: heard.confidence, reply, audio: speech },
      200,
      cors,
    )
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message }, error.status, cors)
    if (error instanceof ProviderError)
      return json(
        { error: error.message, provider: error.provider },
        error.status === 503 ? 503 : 502,
        cors,
      )
    return json(
      { error: error instanceof Error ? error.message : 'voice request failed' },
      500,
      cors,
    )
  }
}
