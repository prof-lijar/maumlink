import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { z } from 'zod'
import { episodes } from '@/content/episodeIndex'

/**
 * Completion records for the current content (2026-10-10 재구성 이후). Records made with the
 * earlier content stay untouched under `maumlink.progress.mvp-v1` and are not carried over,
 * because the stories behind the same IDs changed.
 */
export const PROGRESS_KEY = 'maumlink.progress.mvp-v2'
export const PREVIOUS_PROGRESS_KEY = 'maumlink.progress.mvp-v1'

const validIds = new Set(episodes.map((episode) => episode.id))
interface MvpProgressState {
  completedEpisodeIds: string[]
  markCompleted: (id: string) => void
}

const StoredProgress = z
  .object({ completedEpisodeIds: z.array(z.string()).catch([]) })
  .catch({ completedEpisodeIds: [] })

export const useMvpProgress = create<MvpProgressState>()(
  persist(
    (set) => ({
      completedEpisodeIds: [],
      markCompleted: (id) => {
        if (!validIds.has(id)) return
        try {
          set((state) => ({
            completedEpisodeIds: state.completedEpisodeIds.includes(id)
              ? state.completedEpisodeIds
              : [...state.completedEpisodeIds, id],
          }))
        } catch {
          // Zustand has updated memory before persistence fails. Keep the activity usable;
          // completionStored() makes the completion screen show the storage warning.
        }
      },
    }),
    {
      name: PROGRESS_KEY,
      partialize: (state) => ({ completedEpisodeIds: state.completedEpisodeIds }),
      merge: (stored, current) => ({
        ...current,
        completedEpisodeIds: [...new Set(StoredProgress.parse(stored).completedEpisodeIds)].filter(
          (id) => validIds.has(id),
        ),
      }),
    },
  ),
)

export const completionPercent = (count: number) => Math.round((count / episodes.length) * 100)
