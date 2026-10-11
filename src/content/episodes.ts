import rawA01 from '@content/episodes/A01.json'
import rawB01 from '@content/episodes/B01.json'
import rawC01 from '@content/episodes/C01.json'
import rawD01 from '@content/episodes/D01.json'
import { StepEpisodeSchema, type StepEpisode } from './stepSchema'
export { StepEpisodeSchema, type StepEpisode } from './stepSchema'
import { episodes } from '@/content/episodeIndex'

/**
 * The four reviewed stories, one per social-emotional area (자기 인식 · 관계 인식 ·
 * 관계 관리 · 마음건강관리). Their wording comes from the educator design documents
 * (content-source/reviewed/); only the step structure around it is app authoring.
 */
export const stepEpisodes = [rawA01, rawB01, rawC01, rawD01].map((raw) =>
  StepEpisodeSchema.parse(raw),
)
const stepById = new Map(stepEpisodes.map((episode) => [episode.id, episode]))
if (
  stepById.size !== episodes.length ||
  episodes.some((episode) => {
    const content = stepById.get(episode.id)
    return !content || content.domainId !== episode.domainId || content.title !== episode.title
  })
)
  throw new Error('Episode data must match the episode index')
export const getStepEpisode = (id: string): StepEpisode | undefined => stepById.get(id)
