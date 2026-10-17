/** Export exact spoken Korean phrases for production; no API calls or credentials. */
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { UiFile } from '../src/content/schema.ts'
import { StepEpisodeSchema } from '../src/content/stepSchema.ts'
import { NARRATION_VOICES } from '../src/services/narration/voices'
import { emotionBodyFeedback } from '../src/engine/stepGame'
import { narrationKey } from '../src/services/recordedNarration'
import { STORY_DIALOG_COPY } from '../src/screens/storyDialogCopy'
import gameCopy from '../content/game-copy.json'

const readJson = (path: string): unknown => JSON.parse(readFileSync(path, 'utf8'))
const ui = UiFile.parse(readJson('content/ui.json'))
const entries = new Map<string, { id: string; text: string; sources: string[] }>()
const add = (text: string | undefined, source: string) => {
  if (!text?.trim()) return
  const key = narrationKey(text)
  const previous = entries.get(key)
  if (previous) previous.sources.push(source)
  else
    entries.set(key, {
      id: createHash('sha256').update(key).digest('hex').slice(0, 12),
      text,
      sources: [source],
    })
}

for (const key of ['home.greeting', 'voice.sample']) add(ui[key]?.ko, `ui.${key}`)

/** Fixed lines the game screens read before content text (see StepEpisodeGame). */
for (const [id, text] of Object.entries({
  completion: gameCopy.completionCheer,
  goodChoice: '멋져요! 좋은 방법을 골랐어요.',
  sorted: '멋져요! 행동을 나눴어요.',
  sortIntro: '행동을 나눠 봐요.',
  retry: '다시 한 번 생각해 볼까요?',
  situation: '상황을 살펴봐요',
  practice: '소리 내어 따라 말해 보아요. 읽어 보기만 해도 괜찮아요.',
}))
  add(text, `screen.${id}`)

/** The story-list question before resuming or replaying (StoryDialog reads title + body). */
for (const [mode, copy] of Object.entries(STORY_DIALOG_COPY))
  add(`${copy.title} ${copy.body}`, `storyDialog.${mode}`)

/** Every sentence a screen can read aloud, per episode (both formats). */
for (const file of readdirSync('content/episodes').filter((name) => name.endsWith('.json'))) {
  const raw = readJson(`content/episodes/${file}`) as { format?: string }
  if (raw.format === 'steps') {
    const episode = StepEpisodeSchema.parse(raw)
    const put = (text: string | undefined, field: string) => add(text, `${episode.id}.${field}`)
    episode.situation.sentences.forEach((line, i) => put(line, `situation.${i}`))
    episode.steps.forEach((step, i) => {
      const at = `steps.${i}`
      if ('prompt' in step) put(step.prompt, `${at}.prompt`)
      if ('options' in step)
        for (const option of step.options) {
          put(option.text, `${at}.options.${option.id}`)
          if ('feedback' in option) put(option.feedback, `${at}.options.${option.id}.feedback`)
        }
      if ('closing' in step) put(step.closing, `${at}.closing`)
      if ('title' in step) put(step.title, `${at}.title`)
      if ('instruction' in step) put(step.instruction, `${at}.instruction`)
      if ('hint' in step) put(step.hint, `${at}.hint`)
      if ('correctFeedback' in step) put(step.correctFeedback, `${at}.correctFeedback`)
      if ('retryFeedback' in step) put(step.retryFeedback, `${at}.retryFeedback`)
      if ('message' in step) put(step.message, `${at}.message`)
      if (step.kind === 'dialogue')
        step.lines.forEach((line, j) => put(line.text, `${at}.lines.${j}`))
      if (step.kind === 'note') step.lines.forEach((line, j) => put(line, `${at}.lines.${j}`))
      if (step.kind === 'sequence')
        for (const card of step.cards) put(card.text, `${at}.cards.${card.id}`)
      if (step.kind === 'emotion_body_match') {
        for (const emotion of step.emotions) put(emotion.text, `${at}.emotions.${emotion.id}`)
        for (const body of step.bodies) put(body.text, `${at}.bodies.${body.id}`)
        // The screen reads a composed sentence per pair after the body text; record it whole.
        for (const emotion of step.emotions)
          for (const body of step.bodies)
            put(
              emotionBodyFeedback(step, emotion.id, body.id),
              `${at}.feedback.${emotion.id}.${body.id}`,
            )
      }
      if (step.kind === 'conversation') {
        put(step.intro, `${at}.intro`)
        step.turns.forEach((turn, j) => {
          put(turn.prompt, `${at}.turns.${j}.prompt`)
          for (const line of turn.options) {
            put(line.text, `${at}.turns.${j}.${line.id}`)
            put(line.reply, `${at}.turns.${j}.${line.id}.reply`)
            put(line.tip, `${at}.turns.${j}.${line.id}.tip`)
          }
        })
      }
      if (step.kind === 'expression_choice') {
        step.situations.forEach((situation, j) => {
          situation.story.forEach((line, k) => put(line, `${at}.situations.${j}.story.${k}`))
          put(situation.question, `${at}.situations.${j}.question`)
          put(situation.hint, `${at}.situations.${j}.hint`)
          for (const choice of situation.choices) {
            put(choice.text, `${at}.situations.${j}.${choice.id}`)
            put(choice.feedback, `${at}.situations.${j}.${choice.id}.feedback`)
          }
        })
        if (step.practice) {
          put(step.practice.title, `${at}.practice.title`)
          put(step.practice.sentence, `${at}.practice.sentence`)
          put(step.practice.completionMessage, `${at}.practice.completionMessage`)
        }
      }
    })
    put(episode.takeaway, 'takeaway')
  }
}

// One phrase list for every voice set: the same clip id names `<audioDir>/<id>.mp3` per voice.
const clips = [...entries.values()].map((entry) => ({
  ...entry,
  recorded: Object.fromEntries(
    Object.values(NARRATION_VOICES).map((voice) => [
      voice.id,
      voice.clips.some((clip) => narrationKey(clip.text) === narrationKey(entry.text)),
    ]),
  ),
}))
mkdirSync('content-source/narration', { recursive: true })
writeFileSync(
  'content-source/narration/inventory.json',
  `${JSON.stringify({ voices: Object.keys(NARRATION_VOICES), clips }, null, 2)}\n`,
)
for (const voice of Object.values(NARRATION_VOICES))
  console.log(
    `${voice.id}: ${clips.filter((clip) => clip.recorded[voice.id]).length}/${clips.length} phrases recorded`,
  )
