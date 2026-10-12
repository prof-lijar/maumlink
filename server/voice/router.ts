/**
 * The voice API as one framework-free function `Request → Response`, so the same code runs
 * as a Vercel Function (api/voice/[action].ts), inside the Vite dev/preview server
 * (scripts/voice-dev-server.ts) and in unit tests.
 *
 *   GET  /api/voice/health      → which providers are configured
 *   POST /api/voice/transcribe  { audio, sampleRate }            → { transcript, confidence }  (Gemini 3.5 Transcribe)
 *   POST /api/voice/respond     { text, context }                → { reply }
 *   POST /api/voice/speak       { text }                         → audio/mpeg  (ElevenLabs TTS)
 *   POST /api/voice/turn        { audio, sampleRate, context }   → { transcript, reply, audio?, error? }
 *   POST /api/voice/wrapup      { story, situation, takeaway, turns } → { text, audio? }
 *
 * `audio` is a base64 16-bit mono PCM WAV (src/voice/wav.ts). Nothing is stored server-side.
 */
import { readVoiceEnv, sttConfigured, type VoiceEnv } from './env'
import {
  generateReply,
  generateWrapup,
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
const ACTIONS = new Set(['health', 'transcribe', 'respond', 'speak', 'turn', 'wrapup'])

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
          stt: sttConfigured(env),
          ai: Boolean(env.googleAiKey),
          tts: Boolean(env.elevenLabsKey),
          model: env.googleAiModel,
          sttProvider: env.sttProvider,
          sttModel: env.sttProvider === 'google' ? env.googleSttModel : env.elevenLabsSttModel,
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
    if (action === 'wrapup') {
      const takeaway = asText(body.takeaway)
      if (!takeaway) throw new HttpError(400, 'takeaway is required')
      const turns = (Array.isArray(body.turns) ? body.turns : [])
        .map((turn) => {
          const t = (turn ?? {}) as Record<string, unknown>
          return { prompt: asText(t.prompt) || undefined, said: asText(t.said) }
        })
        .filter((turn) => turn.said)
        .slice(0, 8)
      if (!turns.length) throw new HttpError(400, 'turns with said text are required')
      const context = asContext(body)
      const text = await generateWrapup(
        env,
        { story: context.story, situation: context.situation, takeaway, turns },
        fetcher,
      )
      let speech: string | undefined
      if (env.elevenLabsKey) {
        try {
          speech = Buffer.from(await synthesizeSpeech(env, text, fetcher)).toString('base64')
        } catch {
          speech = undefined
        }
      }
      return json({ text, audio: speech }, 200, cors)
    }
    // turn: the whole exchange in one round trip. TTS is best-effort: a missing ElevenLabs key
    // or a failed synthesis still returns the text so the browser voice can read it.
    const { audio, sampleRate } = asAudio(body)
    const heard = await transcribeWav(env, audio, sampleRate, fetcher)
    if (!heard.transcript) return json({ transcript: '', reply: '' }, 200, cors)
    // The child's words are worth showing even when the reply cannot be written (no AI key,
    // quota, outage): answer 200 with the transcript and name the failed provider.
    let reply: string
    try {
      reply = await generateReply(env, heard.transcript, asContext(body.context), fetcher)
    } catch (error) {
      const detail = error instanceof ProviderError ? error.message : 'reply failed'
      return json(
        {
          transcript: heard.transcript,
          confidence: heard.confidence,
          reply: '',
          error: detail,
          provider: 'ai',
        },
        200,
        cors,
      )
    }
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
