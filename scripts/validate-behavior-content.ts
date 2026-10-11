/** Validate the versioned behavior activities; legacy PDF checks do not cover them. */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { BehaviorEpisodeSchema } from '../src/content/behaviorSchema.ts'
import { StepEpisodeSchema } from '../src/content/stepSchema.ts'

export const EPISODE_COUNT = 15

export function validateBehaviorContent(root: string): string[] {
  const errors: string[] = []
  const index = JSON.parse(readFileSync(join(root, 'content/episode-index.json'), 'utf8')) as {
    episodes: { id: string; title: string; domainId: string }[]
  }
  const files = readdirSync(join(root, 'content/episodes')).filter((file) => file.endsWith('.json'))
  // 12 MVP episodes + C04 (1차 개선) + C05 (2차) + D04 (3차); C01, C04, C05, B02, D04 use the step format.
  if (files.length !== EPISODE_COUNT || index.episodes.length !== EPISODE_COUNT)
    errors.push(`Behavior content must have exactly ${EPISODE_COUNT} episodes`)
  const seen = new Set<string>()
  for (const file of files) {
    try {
      const raw = JSON.parse(readFileSync(join(root, 'content/episodes', file), 'utf8'))
      const parsed =
        raw?.format === 'steps'
          ? StepEpisodeSchema.safeParse(raw)
          : BehaviorEpisodeSchema.safeParse(raw)
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
    errors.push('Indexed behavior episode is missing or invalid')
  return errors
}
