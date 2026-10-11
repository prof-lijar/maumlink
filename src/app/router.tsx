import { createBrowserRouter, Navigate, useParams } from 'react-router'
import { AppShell } from './AppShell'
import { Home } from '@/screens/Home'
import { DomainEpisodes } from '@/screens/DomainEpisodes'
import { BehaviorGame } from '@/screens/BehaviorGame'

export const router = createBrowserRouter([
  {
    Component: AppShell,
    children: [
      { index: true, Component: Home },
      { path: 'area/:domainId', Component: DomainEpisodes },
      // The question screen now opens with the situation, so the old intro URL forwards to it.
      { path: 'episode/:episodeId', Component: ToEpisodePlay },
      { path: 'episode/:episodeId/play', Component: BehaviorGame },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

function ToEpisodePlay() {
  const { episodeId = '' } = useParams()
  return <Navigate to={`/episode/${episodeId}/play`} replace />
}
