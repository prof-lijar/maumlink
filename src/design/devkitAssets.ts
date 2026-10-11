/**
 * Artwork paths. Every picture is a Codex-generated cartoon render from
 * content-source/art/manifest.json, optimised by `pnpm art:build` into public/img/v3
 * (sprites: <id>-400/-800.webp with alpha; scenes: <id>-800/-1600.webp + <id>.png).
 * Nothing is fetched from outside the app bundle at runtime.
 */
import type { DomainId } from '@/content/episodeIndex'
import type { AvatarId } from '@/services/profile'

const V3 = '/img/v3'
const sprite = (id: string, width: 400 | 800 = 400) => `${V3}/${id}-${width}.webp`
const scene = (id: string, width: 800 | 1600 = 800) => `${V3}/${id}-${width}.webp`

/** Named pictures used by more than one screen. */
export const devkitArt = {
  village: scene('bg-village', 1600),
  villageNarrow: scene('bg-village', 800),
  classroom: scene('scene-B02'),
  haruFull: sprite('char-haru', 800),
  haruAvatar: sprite('char-haru'),
  haruWave: sprite('char-haru'),
  haruThinking: sprite('guide-think'),
  haruCelebrate: sprite('celebrate', 800),
  dog: sprite('guide-wave', 800),
  guidePoint: sprite('guide-point'),
  guideCheer: sprite('guide-cheer'),
  b02Intro: scene('scene-B02'),
  b02Success: sprite('celebrate', 800),
  b02Retry: sprite('guide-think'),
  teacher: sprite('teacher'),
} as const

/** The four companions the child can pick (하루 · 소라 · 미나 · 준), full body. */
export const avatarArt: Record<AvatarId, string> = {
  haru: sprite('char-haru'),
  sora: sprite('char-sora'),
  mina: sprite('char-mina'),
  jun: sprite('char-jun'),
}
export const avatarArtLarge: Record<AvatarId, string> = {
  haru: sprite('char-haru', 800),
  sora: sprite('char-sora', 800),
  mina: sprite('char-mina', 800),
  jun: sprite('char-jun', 800),
}
export const avatarNames: Record<AvatarId, string> = {
  haru: '하루',
  sora: '소라',
  mina: '미나',
  jun: '준',
}

/** 친구와 대화하기: my face is the chosen companion; the friend is another companion. */
export function conversationFaces(avatarId: AvatarId | null) {
  const me: AvatarId = avatarId ?? 'haru'
  const friend: AvatarId = me === 'sora' ? 'mina' : 'sora'
  return { me: avatarArt[me], friend: avatarArt[friend] }
}

/** Landmark art per place (생활 정원 · 우리 집 · 학교 · 도움 쉼터). */
export const placeArt: Record<DomainId, string> = {
  A: sprite('place-playground'),
  B: sprite('place-home'),
  C: sprite('place-school'),
  D: sprite('place-heart'),
}

/** Home map: generated village background and the landmark for each place. */
export const mapBackground = scene('bg-village', 1600)
export const mapPlaces: Record<DomainId, { image: string; height: number; wide: boolean }> = {
  A: { image: sprite('place-playground', 800), height: 140, wide: true },
  B: { image: sprite('place-home', 800), height: 150, wide: false },
  C: { image: sprite('place-school', 800), height: 150, wide: false },
  D: { image: sprite('place-heart', 800), height: 160, wide: true },
}

const episodeIds = [
  'A01',
  'A02',
  'A03',
  'B01',
  'B02',
  'B03',
  'C01',
  'C02',
  'C03',
  'C04',
  'C05',
  'D01',
  'D02',
  'D03',
  'D04',
] as const

/** Small same-style object pictures for the episode list and completion rows. */
export const episodeThumb: Record<string, string> = Object.fromEntries(
  episodeIds.map((id) => [id, sprite(`thumb-${id}`)]),
)

/** The scene picture (1536 × 1024 renders) shown above the situation text. */
const sceneIds: Record<string, string> = {
  C01: 'scene-social-playground',
  C04: 'scene-self-presentation-teasing',
  C05: 'scene-relation-pencil-prank',
  D04: 'scene-mind-lunch-line',
}
export const sceneArt: Record<string, string> = Object.fromEntries(
  episodeIds.map((id) => [id, scene(sceneIds[id] ?? `scene-${id}`)]),
)
export const sceneArtLarge: Record<string, string> = Object.fromEntries(
  episodeIds.map((id) => [id, scene(sceneIds[id] ?? `scene-${id}`, 1600)]),
)
/** srcset so HiDPI phones get the 1600 px scene. */
export const sceneSrcSet = (id: string) => `${sceneArt[id]} 800w, ${sceneArtLarge[id]} 1600w`

/** Cartoon face card for a reviewed emotion id (angry, upset, …, not-sure). */
export const faceArt = (emotionId: string) => sprite(`face-${emotionId}`)

export const b02ChoiceArt: Record<string, string> = {
  A: sprite('b02-speak-now'),
  B: sprite('b02-raise-hand'),
  C: sprite('b02-talk-friend'),
}
export const b02SequenceArt: Record<string, string> = {
  pause: sprite('b02-pause'),
  raise: sprite('b02-raise-hand'),
  speak: sprite('b02-speak-turn'),
}

export interface EpisodeTile {
  background: string
  color?: string
  glyph?: string
  image?: string
}
const tileTint: Record<DomainId, string> = {
  A: '#e3f5ea',
  B: '#fff0dc',
  C: '#e4f1fb',
  D: '#fde8ef',
}
/** List tiles: the episode's thumbnail on a tint for its place. */
export const episodeTile = (id: string): EpisodeTile => ({
  image: episodeThumb[id],
  background: tileTint[id[0] as DomainId] ?? '#fff1e4',
})
