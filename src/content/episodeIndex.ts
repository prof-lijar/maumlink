import raw from '@content/episode-index.json'
import { z } from 'zod'

const DomainId = z.enum(['A', 'B', 'C', 'D'])
const Domain = z.object({
  id: DomainId,
  name: z.string().min(1),
  place: z.string().min(1),
  /** Short label above the place art on the home map. */
  mapName: z.string().min(1),
  symbol: z.string().min(1),
  description: z.string().min(1),
})
const Episode = z.object({
  id: z.string().regex(/^[ABCD]\d{2}$/),
  domainId: DomainId,
  title: z.string().min(1),
  /** Child-facing one-line description on the episode list. */
  summary: z.string().min(1),
  /** Optional child-facing skill label shown on the list and game screens. */
  skillTag: z.string().min(1).optional(),
  symbol: z.string().min(1),
  objective: z.string().min(1),
  situation: z.string().min(1),
  safetyNote: z.string().min(1),
})
const Index = z
  .object({
    packId: z.literal('mvp-v1'),
    schemaVersion: z.literal(1),
    domains: z.array(Domain).length(4),
    episodes: z.array(Episode).length(15),
  })
  .superRefine((index, ctx) => {
    if (new Set(index.domains.map((d) => d.id)).size !== 4)
      ctx.addIssue({ code: 'custom', message: 'Each domain must appear once' })
    if (new Set(index.episodes.map((e) => e.id)).size !== index.episodes.length)
      ctx.addIssue({ code: 'custom', message: 'Episode IDs must be unique' })
    // Episode IDs are stable storage keys, so an episode keeps its ID when it moves to
    // another domain (A03 now lives in C). Domains may hold different numbers of episodes.
    for (const id of DomainId.options) {
      if (!index.episodes.some((e) => e.domainId === id))
        ctx.addIssue({ code: 'custom', message: `Domain ${id} needs at least one episode` })
    }
  })

export const episodeIndex = Index.parse(raw)
export type DomainId = z.infer<typeof DomainId>
export type Episode = z.infer<typeof Episode>
export const domains = episodeIndex.domains
export const episodes = episodeIndex.episodes
export const getDomain = (id: string) => domains.find((domain) => domain.id === id)
export const getEpisode = (id: string) => episodes.find((episode) => episode.id === id)
export const episodesFor = (id: DomainId) => episodes.filter((episode) => episode.domainId === id)
