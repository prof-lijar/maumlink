import { Navigate, useParams } from 'react-router'

/** The question screen now opens with the situation, so the old intro URL forwards to it. */
export function ToEpisodePlay() {
  const { episodeId = '' } = useParams()
  return <Navigate to={`/episode/${episodeId}/play`} replace />
}
