#!/usr/bin/env tsx
/**
 * `pnpm narration:generate:elevenlabs [--voice lulu-lolipop] [--out .narration-downloads/<voice>] [--limit n] [--concurrency 3]`
 *
 * One-time generation of the narration clips a voice set has not recorded yet, with the
 * ElevenLabs text-to-speech API in the set's own voice id and model (Lulu Lolipop, Eleven v4).
 * Every unrecorded phrase of content-source/narration/inventory.json is synthesised once to
 * `<out>/<clip id>.mp3`; afterwards `pnpm narration:import <out> --voice <voice>` bundles them.
 * The app itself never calls the API for narration.
 *
 * Emotion audio tags (Eleven v4) are prefixed by phrase kind, as the first batch did
 * (content-source/narration/<voice>-generation.json); they are not spoken. The key comes from
 * ELEVENLABS_API_KEY in `.env.dev` (or `.env.local`).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { narrationKey } from '../src/services/recordedNarration'
import { isNarrationVoiceId, NARRATION_VOICES } from '../src/services/narration/voices'
import { loadVoiceEnv } from './voice-dev-server'

const root = fileURLToPath(new URL('..', import.meta.url))
const args = process.argv.slice(2)
const option = (name: string): string | undefined => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}
const voiceId = option('voice') ?? 'lulu-lolipop'
if (!isNarrationVoiceId(voiceId)) {
  console.error(
    `unknown voice set "${voiceId}"; known: ${Object.keys(NARRATION_VOICES).join(', ')}`,
  )
  process.exit(1)
}
const voice = NARRATION_VOICES[voiceId]
if (voice.provider !== 'ElevenLabs') {
  console.error(`${voiceId} is a ${voice.provider} set; this script is for ElevenLabs voices.`)
  process.exit(1)
}
const out = resolve(root, option('out') ?? join('.narration-downloads', voiceId))
mkdirSync(out, { recursive: true })
const limit = Number(option('limit') ?? 0) || Infinity
const concurrency = Math.max(1, Number(option('concurrency') ?? 3) || 3)

if (!loadVoiceEnv(root, '.env.dev')) loadVoiceEnv(root, '.env.local')
const apiKey = process.env.ELEVENLABS_API_KEY?.trim()
if (!apiKey) {
  console.error('Set ELEVENLABS_API_KEY in maumlink/.env.dev first.')
  process.exit(1)
}
const MODEL_IDS: Record<string, string> = { 'Eleven v4': 'eleven_v4', 'Eleven v3': 'eleven_v3' }
const modelId = MODEL_IDS[voice.model] ?? process.env.ELEVENLABS_MODEL_ID?.trim() ?? 'eleven_v4'

/** Same tagging idea as the first batch: a gentle emotion hint by the kind of line. */
function tagFor(sources: string[]): string {
  const s = sources.join(' ')
  if (/screen\.completion|goodChoice|sorted/.test(s)) return '[cheerfully]'
  if (/situation\./.test(s)) return '[softly]'
  if (/\.hint|screen\.retry|retryFeedback|\.tip/.test(s)) return '[gently]'
  if (/\.feedback|\.closing|correctFeedback|\.message|\.title|\.instruction/.test(s))
    return '[warmly]'
  if (/\.prompt|storyDialog\.|\.intro/.test(s)) return '[curious]'
  return ''
}

interface Inventory {
  clips: Array<{ id: string; text: string; sources: string[] }>
}
const inventory = JSON.parse(
  readFileSync(join(root, 'content-source/narration/inventory.json'), 'utf8'),
) as Inventory
const recorded = new Set(voice.clips.map((clip) => narrationKey(clip.text)))
const todo = inventory.clips
  .filter(
    (phrase) =>
      !recorded.has(narrationKey(phrase.text)) && !existsSync(join(out, `${phrase.id}.mp3`)),
  )
  .slice(0, limit)
console.log(
  `${voiceId} (${voice.voiceId}, ${modelId}): ${todo.length} of ${inventory.clips.length} phrases to generate → ${out}`,
)

async function synthesize(text: string): Promise<Buffer> {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice.voiceId}?output_format=mp3_44100_128`
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey!, 'content-type': 'application/json', accept: 'audio/mpeg' },
      body: JSON.stringify({ text, model_id: modelId }),
    })
    if (res.ok) return Buffer.from(await res.arrayBuffer())
    const detail = (await res.text()).slice(0, 300)
    if ((res.status === 429 || res.status >= 500) && attempt < 5) {
      await new Promise((r) => setTimeout(r, 2000 * attempt))
      continue
    }
    throw new Error(`ElevenLabs ${res.status} for "${text.slice(0, 30)}…": ${detail}`)
  }
}

const recordPath = join(root, `content-source/narration/${voiceId}-generation.json`)
interface GenerationRecord {
  voiceId: string
  model: string
  generatedAt: string
  speed?: string
  note?: string
  phrases: Array<{ id: string; tag: string; text: string; source: string; generatedAt?: string }>
}
const record: GenerationRecord = existsSync(recordPath)
  ? (JSON.parse(readFileSync(recordPath, 'utf8')) as GenerationRecord)
  : { voiceId: voice.voiceId, model: modelId, generatedAt: '', phrases: [] }
const today = new Date().toISOString().slice(0, 10)

let done = 0
let chars = 0
let failed = 0
const queue = [...todo]
async function worker() {
  for (let phrase = queue.shift(); phrase; phrase = queue.shift()) {
    const tag = tagFor(phrase.sources)
    try {
      const audio = await synthesize(tag ? `${tag} ${phrase.text}` : phrase.text)
      writeFileSync(join(out, `${phrase.id}.mp3`), audio)
      record.phrases.push({
        id: phrase.id,
        tag,
        text: phrase.text,
        source: phrase.sources[0] ?? '',
        generatedAt: today,
      })
      done += 1
      chars += phrase.text.length
      console.log(`${String(done).padStart(3)}/${todo.length} ${phrase.id} ${tag} ${phrase.text}`)
    } catch (error) {
      failed += 1
      console.error(`   ✗ ${phrase.id} ${(error as Error).message}`)
    }
  }
}
await Promise.all(Array.from({ length: concurrency }, worker))
writeFileSync(recordPath, `${JSON.stringify(record, null, 2)}\n`)
console.log(
  `done: ${done} generated (${chars} chars), ${failed} failed. Next: pnpm narration:import ${out} --voice ${voiceId}`,
)
if (failed) process.exit(1)
