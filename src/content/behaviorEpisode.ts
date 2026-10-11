import rawA01 from '@content/episodes/A01.json'
import rawA02 from '@content/episodes/A02.json'
import rawA03 from '@content/episodes/A03.json'
import rawB01 from '@content/episodes/B01.json'
import rawB02 from '@content/episodes/B02.json'
import rawB03 from '@content/episodes/B03.json'
import rawC01 from '@content/episodes/C01.json'
import rawC02 from '@content/episodes/C02.json'
import rawC03 from '@content/episodes/C03.json'
import rawC04 from '@content/episodes/C04.json'
import rawC05 from '@content/episodes/C05.json'
import rawD01 from '@content/episodes/D01.json'
import rawD02 from '@content/episodes/D02.json'
import rawD03 from '@content/episodes/D03.json'
import rawD04 from '@content/episodes/D04.json'
import { BehaviorEpisodeSchema, type BehaviorEpisode } from './behaviorSchema'
import { StepEpisodeSchema, type StepEpisode } from './stepSchema'
export { BehaviorEpisodeSchema, type BehaviorEpisode } from './behaviorSchema'
export { StepEpisodeSchema, type StepEpisode } from './stepSchema'
import { episodes } from '@/content/episodeIndex'

const rawEpisodes: unknown[] = [
  rawA01,
  rawA02,
  rawA03,
  rawB01,
  rawB02,
  rawB03,
  rawC01,
  rawC02,
  rawC03,
  rawC04,
  rawC05,
  rawD01,
  rawD02,
  rawD03,
  rawD04,
]
const isStepEpisode = (raw: unknown) =>
  typeof raw === 'object' && raw !== null && (raw as { format?: unknown }).format === 'steps'
/** Choice + sorting episodes (the original flow). */
export const behaviorEpisodes = rawEpisodes
  .filter((raw) => !isStepEpisode(raw))
  .map((raw) => BehaviorEpisodeSchema.parse(raw))
/** Step-based episodes (2차 개선: feelings, thoughts, perspective sort, sequence). */
export const stepEpisodes = rawEpisodes
  .filter(isStepEpisode)
  .map((raw) => StepEpisodeSchema.parse(raw))
const byId = new Map(behaviorEpisodes.map((episode) => [episode.id, episode]))
const stepById = new Map(stepEpisodes.map((episode) => [episode.id, episode]))
if (
  byId.size + stepById.size !== episodes.length ||
  episodes.some((episode) => {
    const content = byId.get(episode.id) ?? stepById.get(episode.id)
    return !content || content.domainId !== episode.domainId || content.title !== episode.title
  })
)
  throw new Error('Behavior episode data must match the episode index')
export const getBehaviorEpisode = (id: string): BehaviorEpisode | undefined => byId.get(id)
export const getStepEpisode = (id: string): StepEpisode | undefined => stepById.get(id)
