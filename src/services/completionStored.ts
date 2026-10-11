import { PROGRESS_KEY } from './mvpProgress'

/** True when the episode is in the saved completion list (storage may silently fail). */
export function completionStored(id: string): boolean {
  try {
    const stored = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? 'null')
    return Boolean(stored?.state?.completedEpisodeIds?.includes(id))
  } catch {
    return false
  }
}
