/**
 * Cartoon artwork paths (public/img/v3, built by `pnpm art:build` from the Codex renders
 * listed in content-source/art/manifest.json). Every sprite ships as 400/800 px WebP with
 * alpha; scenes ship as 800/1600 px WebP plus a PNG fallback. Nothing is fetched at runtime
 * from outside the app bundle.
 */
import type { Domain } from '@/content/schema'
import type { Avatar } from '@/services/settings'

const BASE = '/img/v3'

export type GuidePose = 'wave' | 'point' | 'think' | 'cheer'

export const art = {
  /** Full-body companion character; `object-position: top` crops it to a bust. */
  character: (id: Avatar, width: 400 | 800 = 400) => `${BASE}/char-${id}-${width}.webp`,
  /** The puppy guide who asks the questions and gives feedback. */
  guide: (pose: GuidePose, width: 400 | 800 = 400) => `${BASE}/guide-${pose}-${width}.webp`,
  /** Village landmark for a learning area: a vignette of that area's lesson scene. */
  place: (domain: Domain, width: 400 | 800 = 400) =>
    `${BASE}/place-${domain === 'reserved' ? 'self' : domain}-${width}.webp`,
  /** Cartoon face card for an emotion id (falls back to the line icon when missing). */
  face: (emotionId: string, width: 400 | 800 = 400) => `${BASE}/face-${emotionId}-${width}.webp`,
  village: (width: 800 | 1600 = 1600) => `${BASE}/bg-village-${width}.webp`,
  celebrate: (width: 400 | 800 = 800) => `${BASE}/celebrate-${width}.webp`,
}

/** Chat-bubble sizes share one srcset so the browser picks the sharper file on HiDPI. */
export function sprite(src400: string, src800: string) {
  return { src: src400, srcSet: `${src400} 400w, ${src800} 800w` }
}
