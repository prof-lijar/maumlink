import { Navigate, useParams } from 'react-router'
import { getStepEpisode } from '@/content/episodes'
import { StepEpisodeGame } from './StepEpisodeGame'
import { useProfile } from '@/services/profile'
import { useSettings } from '@/services/settings'

/** `/episode/:episodeId/play` — the story screen for one of the four reviewed stories. */
export function EpisodePlay() {
  const { episodeId = '' } = useParams()
  const episode = getStepEpisode(episodeId)
  const started = useSettings((state) => state.started)
  const avatarId = useProfile((state) => state.avatarId)
  if (!started || !avatarId || !episode) return <Navigate to="/" replace />
  return <StepEpisodeGame key={episode.id} episode={episode} />
}
