import { createBrowserRouter, Navigate } from 'react-router'
import { AppShell } from './AppShell'
import { ToEpisodePlay } from './ToEpisodePlay'
import { Home } from '@/screens/Home'
import { DomainEpisodes } from '@/screens/DomainEpisodes'
import { EpisodePlay } from '@/screens/EpisodePlay'

export const router = createBrowserRouter([
  {
    Component: AppShell,
    children: [
      { index: true, Component: Home },
      { path: 'area/:domainId', Component: DomainEpisodes },
      // The question screen now opens with the situation, so the old intro URL forwards to it.
      { path: 'episode/:episodeId', Component: ToEpisodePlay },
      { path: 'episode/:episodeId/play', Component: EpisodePlay },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
