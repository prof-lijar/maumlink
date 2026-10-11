/** Validate the versioned story content (content/episodes) against the step schema and index. */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { StepEpisodeSchema } from '../src/content/stepSchema.ts'

export const EPISODE_COUNT = 5

export function validateBehaviorContent(root: string): string[] {
  const errors: string[] = []
  const index = JSON.parse(readFileSync(join(root, 'content/episode-index.json'), 'utf8')) as {
    episodes: { id: string; title: string; domainId: string }[]
  }
  const files = readdirSync(join(root, 'content/episodes')).filter((file) => file.endsWith('.json'))
  // One reviewed story per social-emotional area (자기 인식 · 관계 인식 · 관계 관리 · 마음건강관리 · 자기관리).
  if (files.length !== EPISODE_COUNT || index.episodes.length !== EPISODE_COUNT)
    errors.push(`Story content must have exactly ${EPISODE_COUNT} episodes`)
  const seen = new Set<string>()
  for (const file of files) {
    try {
      const raw = JSON.parse(readFileSync(join(root, 'content/episodes', file), 'utf8'))
      const parsed = StepEpisodeSchema.safeParse(raw)
      if (!parsed.success) {
        errors.push(
          ...parsed.error.issues.map(
            (issue) => `${file} ${issue.path.join('.')}: ${issue.message}`,
          ),
        )
        continue
      }
      const episode = parsed.data
      const entry = index.episodes.find((item) => item.id === episode.id)
      if (
        seen.has(episode.id) ||
        file !== `${episode.id}.json` ||
        !entry ||
        entry.title !== episode.title ||
        entry.domainId !== episode.domainId
      )
        errors.push(`${file}: ID, title, or domain does not match the episode index`)
      seen.add(episode.id)
    } catch (error) {
      errors.push(`${file}: ${String(error)}`)
    }
  }
  if (index.episodes.some((entry) => !seen.has(entry.id)))
    errors.push('Indexed episode is missing or invalid')
  return errors
}
