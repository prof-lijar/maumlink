/**
 * Thin REST clients for the three providers behind the voice feature. Each takes the already
 * read environment so unit tests can run them against a stubbed `fetch`.
 */
import type { VoiceEnv } from './env'

export class ProviderError extends Error {
  provider: 'stt' | 'ai' | 'tts'
  status: number
  constructor(provider: 'stt' | 'ai' | 'tts', status: number, message: string) {
    super(message)
    this.provider = provider
    this.status = status
  }
}

const readError = async (response: Response) => {
  try {
    const body = (await response.json()) as { error?: { message?: string }; detail?: unknown }
    return body.error?.message ?? JSON.stringify(body.detail ?? body).slice(0, 300)
  } catch {
    return response.statusText
  }
}

/* ── Google Cloud Speech-to-Text (v1, synchronous recognize) ─────────────── */

export interface Transcription {
  transcript: string
  confidence: number
}

export async function transcribeWav(
  env: VoiceEnv,
  wavBase64: string,
  sampleRateHertz: number,
  fetcher: typeof fetch = fetch,
): Promise<Transcription> {
  if (!env.googleSttKey) throw new ProviderError('stt', 503, 'Google STT key is not configured')
  const response = await fetcher('https://speech.googleapis.com/v1/speech:recognize', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': env.googleSttKey },
    body: JSON.stringify({
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz,
        languageCode: 'ko-KR',
        enableAutomaticPunctuation: true,
        model: 'latest_short',
      },
      audio: { content: wavBase64 },
    }),
  })
  if (!response.ok) throw new ProviderError('stt', response.status, await readError(response))
  const data = (await response.json()) as {
    results?: Array<{ alternatives?: Array<{ transcript?: string; confidence?: number }> }>
  }
  const best = data.results?.flatMap((r) => r.alternatives ?? [])[0]
  return { transcript: best?.transcript?.trim() ?? '', confidence: best?.confidence ?? 0 }
}

/* ── Google AI (Gemini) ───────────────────────────────────────────────────── */

export interface ReplyContext {
  /** Story title, e.g. 친구들과 함께 놀고 싶어요. */
  story?: string
  /** The situation sentences the child just saw. */
  situation?: string
  /** The question on the current screen. */
  prompt?: string
  /** The answer cards on the screen, so the reply can connect to them. */
  options?: string[]
}

export const SYSTEM_PROMPT = `너는 초등학교 3학년 느린학습자 어린이와 함께 사회정서교육 이야기를 보는 다정한 친구야.
어린이가 마이크로 말한 내용을 듣고 짧게 대답해.
규칙:
- 한국어로, 쉬운 말로, 두 문장 이내로 말해. 한 문장은 짧게.
- 어린이가 말한 마음을 먼저 그대로 받아 주고("그렇게 느낄 수 있어요"), 어떤 감정도 틀렸다고 하지 마.
- 어린이를 평가하거나 비난하지 말고, 어른처럼 훈계하지 마.
- 화면의 질문과 이어지게 말하고, 화면에 있는 보기 중 하나를 골라 보라고 부드럽게 권해도 돼.
- 이름, 집, 학교 같은 개인정보는 묻지 마.
- 어린이가 다치거나 무섭거나 위험한 일을 말하면, 믿을 수 있는 어른(선생님, 부모님)에게 꼭 이야기하라고 말해.
- 이모티콘, 영어, 어려운 낱말은 쓰지 마.`

export async function generateReply(
  env: VoiceEnv,
  childSaid: string,
  context: ReplyContext,
  fetcher: typeof fetch = fetch,
): Promise<string> {
  if (!env.googleAiKey) throw new ProviderError('ai', 503, 'Google AI key is not configured')
  const lines = [
    context.story && `이야기 제목: ${context.story}`,
    context.situation && `상황: ${context.situation}`,
    context.prompt && `화면 질문: ${context.prompt}`,
    context.options?.length && `화면 보기: ${context.options.join(' / ')}`,
    `어린이가 말한 것: "${childSaid}"`,
  ].filter(Boolean)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.googleAiModel}:generateContent`
  const response = await fetcher(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': env.googleAiKey },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: lines.join('\n') }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 200 },
      safetySettings: [
        'HARM_CATEGORY_HARASSMENT',
        'HARM_CATEGORY_HATE_SPEECH',
        'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        'HARM_CATEGORY_DANGEROUS_CONTENT',
      ].map((category) => ({ category, threshold: 'BLOCK_LOW_AND_ABOVE' })),
    }),
  })
  if (!response.ok) throw new ProviderError('ai', response.status, await readError(response))
  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? ''
  return text.replace(/\s+/g, ' ').trim()
}

/* ── ElevenLabs text-to-speech ────────────────────────────────────────────── */

export async function synthesizeSpeech(
  env: VoiceEnv,
  text: string,
  fetcher: typeof fetch = fetch,
): Promise<ArrayBuffer> {
  if (!env.elevenLabsKey) throw new ProviderError('tts', 503, 'ElevenLabs key is not configured')
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${env.elevenLabsVoiceId}?output_format=mp3_44100_128`
  const response = await fetcher(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'audio/mpeg',
      'xi-api-key': env.elevenLabsKey,
    },
    body: JSON.stringify({
      text,
      model_id: env.elevenLabsModelId,
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  })
  if (!response.ok) throw new ProviderError('tts', response.status, await readError(response))
  return response.arrayBuffer()
}
