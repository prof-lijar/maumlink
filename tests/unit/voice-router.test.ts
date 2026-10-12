// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { readVoiceEnv, type VoiceEnv } from '../../server/voice/env'
import { SYSTEM_PROMPT } from '../../server/voice/providers'
import { handleVoiceRequest, voiceAction } from '../../server/voice/router'

const env: VoiceEnv = {
  ...readVoiceEnv({}),
  googleSttKey: 'stt-key',
  googleAiKey: 'ai-key',
  elevenLabsKey: 'tts-key',
}
const ORIGIN = 'http://localhost:4173'
const request = (action: string, body?: unknown, init: RequestInit = {}) =>
  new Request(`${ORIGIN}/api/voice/${action}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'content-type': 'application/json', origin: ORIGIN },
    body: body === undefined ? undefined : JSON.stringify(body),
    ...init,
  })

/** A provider stub that answers Google STT, Gemini and ElevenLabs by URL. */
function providers(overrides: Partial<Record<'stt' | 'ai' | 'tts', Response>> = {}) {
  const calls: Array<{ url: string; init: RequestInit }> = []
  const fetcher = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    const href = String(url)
    calls.push({ url: href, init: init ?? {} })
    if (href.includes('speech.googleapis.com'))
      return (
        overrides.stt ??
        Response.json({
          results: [{ alternatives: [{ transcript: '속상했어요 ', confidence: 0.9 }] }],
        })
      )
    if (href.includes('generativelanguage.googleapis.com'))
      return (
        overrides.ai ??
        Response.json({
          candidates: [
            { content: { parts: [{ text: '그렇게 느낄 수 있어요.\n보기에서 골라 볼까요?' }] } },
          ],
        })
      )
    if (href.includes('api.elevenlabs.io'))
      return (
        overrides.tts ??
        new Response(new Uint8Array([1, 2, 3]), { headers: { 'content-type': 'audio/mpeg' } })
      )
    throw new Error(`unexpected ${href}`)
  }) as unknown as typeof fetch
  return { fetcher, calls }
}

describe('voice router', () => {
  it('maps URLs to actions', () => {
    expect(voiceAction('http://x/api/voice/turn')).toBe('turn')
    expect(voiceAction('/api/voice/health/')).toBe('health')
    expect(voiceAction('/api/voice/other')).toBeUndefined()
  })

  it('health reports which providers have keys and never the keys themselves', async () => {
    const response = await handleVoiceRequest(request('health'), {
      env: { ...env, elevenLabsKey: undefined },
    })
    const body = await response.json()
    expect(body).toEqual({
      stt: true,
      ai: true,
      tts: false,
      model: 'gemini-2.5-flash',
      voiceId: env.elevenLabsVoiceId,
    })
    expect(JSON.stringify(body)).not.toContain('key')
  })

  it('rejects origins outside the allow list and answers preflight for allowed ones', async () => {
    const bad = await handleVoiceRequest(
      request('health', undefined, { headers: { origin: 'https://evil.example' } }),
      { env },
    )
    expect(bad.status).toBe(403)
    const preflight = await handleVoiceRequest(
      new Request(`${ORIGIN}/api/voice/turn`, {
        method: 'OPTIONS',
        headers: { origin: 'capacitor://localhost' },
      }),
      { env },
    )
    expect(preflight.status).toBe(204)
    expect(preflight.headers.get('access-control-allow-origin')).toBe('capacitor://localhost')
  })

  it('validates requests', async () => {
    expect((await handleVoiceRequest(request('nope'), { env })).status).toBe(404)
    expect((await handleVoiceRequest(request('transcribe'), { env })).status).toBe(405)
    const badJson = await handleVoiceRequest(
      new Request(`${ORIGIN}/api/voice/respond`, { method: 'POST', body: '{' }),
      { env },
    )
    expect(badJson.status).toBe(400)
    expect((await handleVoiceRequest(request('respond', { text: '' }), { env })).status).toBe(400)
    expect((await handleVoiceRequest(request('turn', { sampleRate: 16000 }), { env })).status).toBe(
      400,
    )
    expect(
      (await handleVoiceRequest(request('turn', { audio: 'x'.repeat(2_000_001) }), { env })).status,
    ).toBe(413)
  })

  it('transcribe sends LINEAR16 Korean config with the key in a header', async () => {
    const { fetcher, calls } = providers()
    const response = await handleVoiceRequest(
      request('transcribe', { audio: 'UklGR', sampleRate: 16000 }),
      {
        env,
        fetcher,
      },
    )
    expect(await response.json()).toEqual({ transcript: '속상했어요', confidence: 0.9 })
    const sent = JSON.parse(String(calls[0]!.init.body))
    expect(sent.config).toMatchObject({
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'ko-KR',
    })
    expect((calls[0]!.init.headers as Record<string, string>)['x-goog-api-key']).toBe('stt-key')
    expect(calls[0]!.url).not.toContain('stt-key')
  })

  it('respond asks Gemini with the companion rules and the screen context', async () => {
    const { fetcher, calls } = providers()
    const response = await handleVoiceRequest(
      request('respond', {
        text: '친구가 안 불러서 속상했어요',
        context: {
          story: '친구들과 함께 놀고 싶어요',
          prompt: '어떤 기분이 들까요?',
          options: ['속상해요', '괜찮아요'],
        },
      }),
      { env, fetcher },
    )
    expect(await response.json()).toEqual({ reply: '그렇게 느낄 수 있어요. 보기에서 골라 볼까요?' })
    expect(calls[0]!.url).toContain('/models/gemini-2.5-flash:generateContent')
    const sent = JSON.parse(String(calls[0]!.init.body))
    expect(sent.system_instruction.parts[0].text).toBe(SYSTEM_PROMPT)
    const user = sent.contents[0].parts[0].text as string
    expect(user).toContain('이야기 제목: 친구들과 함께 놀고 싶어요')
    expect(user).toContain('화면 보기: 속상해요 / 괜찮아요')
    expect(user).toContain('"친구가 안 불러서 속상했어요"')
  })

  it('speak streams ElevenLabs audio in the narration voice', async () => {
    const { fetcher, calls } = providers()
    const response = await handleVoiceRequest(request('speak', { text: '안녕' }), { env, fetcher })
    expect(response.headers.get('content-type')).toBe('audio/mpeg')
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]))
    expect(calls[0]!.url).toContain(`/v1/text-to-speech/${env.elevenLabsVoiceId}`)
    expect((calls[0]!.init.headers as Record<string, string>)['xi-api-key']).toBe('tts-key')
    expect(JSON.parse(String(calls[0]!.init.body)).model_id).toBe('eleven_multilingual_v2')
  })

  it('turn chains the three providers and keeps the text when speech fails', async () => {
    const ok = providers()
    const full = await handleVoiceRequest(
      request('turn', { audio: 'UklGR', sampleRate: 16000, context: {} }),
      {
        env,
        fetcher: ok.fetcher,
      },
    )
    expect(await full.json()).toEqual({
      transcript: '속상했어요',
      confidence: 0.9,
      reply: '그렇게 느낄 수 있어요. 보기에서 골라 볼까요?',
      audio: Buffer.from([1, 2, 3]).toString('base64'),
    })
    const noTts = providers({ tts: new Response('nope', { status: 401 }) })
    const textOnly = await handleVoiceRequest(
      request('turn', { audio: 'UklGR', sampleRate: 16000 }),
      {
        env,
        fetcher: noTts.fetcher,
      },
    )
    const textBody = await textOnly.json()
    expect(textBody).toMatchObject({ transcript: '속상했어요', reply: expect.any(String) })
    expect(textBody.audio).toBeUndefined()
    const silent = providers({ stt: Response.json({}) })
    const nothing = await handleVoiceRequest(request('turn', { audio: 'UklGR' }), {
      env,
      fetcher: silent.fetcher,
    })
    expect(await nothing.json()).toEqual({ transcript: '', reply: '' })
    expect(silent.calls).toHaveLength(1)
  })

  it('answers 503 with the provider name when a key is missing, 502 when a provider fails', async () => {
    const missing = await handleVoiceRequest(request('respond', { text: '안녕' }), {
      env: { ...env, googleAiKey: undefined },
      fetcher: providers().fetcher,
    })
    expect(missing.status).toBe(503)
    expect(await missing.json()).toEqual({
      error: 'Google AI key is not configured',
      provider: 'ai',
    })
    const failing = providers({
      stt: Response.json({ error: { message: 'bad audio' } }, { status: 400 }),
    })
    const failed = await handleVoiceRequest(request('transcribe', { audio: 'UklGR' }), {
      env,
      fetcher: failing.fetcher,
    })
    expect(failed.status).toBe(502)
    expect(await failed.json()).toEqual({ error: 'bad audio', provider: 'stt' })
  })

  it('reads keys from the environment with GOOGLE_API_KEY as a fallback', () => {
    const read = readVoiceEnv({
      GOOGLE_API_KEY: 'g',
      ELEVENLABS_API_KEY: ' e ',
      VOICE_ALLOWED_ORIGINS: 'https://a.example, https://b.example',
    })
    expect(read.googleSttKey).toBe('g')
    expect(read.googleAiKey).toBe('g')
    expect(read.elevenLabsKey).toBe('e')
    expect(read.allowedOrigins).toEqual(
      expect.arrayContaining(['https://a.example', 'https://b.example', 'https://localhost']),
    )
  })
})
