import type { DomainId } from '@/content/episodeIndex'

const base = '/devkit'
export const devkitArt = {
  village: `${base}/scenes/village_vertical.png`,
  villageNarrow: `${base}/scenes/village_narrow.png`,
  classroom: `${base}/scenes/classroom.png`,
  haruFull: `${base}/characters/haru_full_body.png`,
  haruAvatar: `${base}/characters/avatar_haru.png`,
  haruWave: `${base}/characters/haru_wave.png`,
  haruThinking: `${base}/characters/haru_thinking.png`,
  haruCelebrate: `${base}/characters/haru_celebrate.png`,
  dog: `${base}/characters/dog_guide.png`,
  b02Intro: `${base}/mini_game_1/scene-intro.png`,
  b02Success: `${base}/mini_game_1/scene-success.png`,
  b02Retry: `${base}/mini_game_1/scene-retry.png`,
  teacher: `${base}/mini_game_1/learning-teacher.png`,
} as const

export const avatarArt = {
  sun: `${base}/characters/avatar_haru.png`,
  sky: `${base}/characters/avatar_brown_hair_girl.png`,
  leaf: `${base}/characters/avatar_pink_girl.png`,
  peach: `${base}/characters/avatar_glasses_boy.png`,
} as const

/** Fallback scene art per place (생활 정원 = playground, 학교 = classroom). */
export const placeArt: Record<DomainId, string> = {
  A: `${base}/places/playground.svg`,
  B: `${base}/places/home.svg`,
  C: `${base}/places/classroom.svg`,
  D: `${base}/places/rest.svg`,
}

export const episodeThumb: Record<string, string> = {
  A01: `${base}/icons/question.svg`,
  A02: `${base}/icons/check.svg`,
  A03: `${base}/icons/pencil.svg`,
  B01: `${base}/icons/backpack.svg`,
  B02: `${base}/characters/avatar_haru.png`,
  B03: `${base}/icons/book.svg`,
  C01: `${base}/places/playground.svg`,
  C02: `${base}/icons/pencil.svg`,
  C03: `${base}/places/playground.svg`,
  C04: `${base}/icons/check.svg`,
  C05: `${base}/icons/pencil.svg`,
  D01: `${base}/places/rest.svg`,
  D02: `${base}/icons/heart.svg`,
  D03: `${base}/places/classroom.svg`,
  D04: `${base}/icons/heart.svg`,
}

export const b02ChoiceArt: Record<string, string> = {
  A: `${base}/mini_game_1/option-speak-now.png`,
  B: `${base}/mini_game_1/option-raise-hand.png`,
  C: `${base}/mini_game_1/option-call-out.png`,
}

export const b02SequenceArt: Record<string, string> = {
  pause: `${base}/mini_game/think_first.png`,
  raise: `${base}/mini_game/raise_hand.png`,
  speak: `${base}/mini_game/speak_when_called.png`,
}

/** Home map (map handoff): background and transparent place art with its drawn height. */
export const mapBackground = '/map/map-bg.webp'
export const mapPlaces: Record<DomainId, { image: string; height: number; wide: boolean }> = {
  A: { image: '/map/playground.webp', height: 140, wide: true },
  B: { image: '/map/home.webp', height: 150, wide: false },
  C: { image: '/map/classroom.webp', height: 150, wide: false },
  D: { image: '/map/tree.webp', height: 160, wide: true },
}

/** Full situation illustrations (1024 × 572) shown on the question screen. */
export const sceneArt: Record<string, string> = {
  A02: '/scenes/a02-spill.webp',
  A03: '/scenes/a03-origami.webp',
  C02: '/scenes/c02-crayon.webp',
  B02: devkitArt.b02Intro,
  D04: '/img/generated/mind-lunch-line-800.webp',
}

export interface EpisodeTile {
  background: string
  color?: string
  glyph?: string
  image?: string
}

/** List tiles: the handoff glyphs for 생활 정원, devkit thumbnails elsewhere. */
export const episodeTile = (id: string): EpisodeTile =>
  ({
    A01: { glyph: '?', background: '#E4F1FB', color: '#3E7CB8' },
    A02: { glyph: '✓', background: '#E3F5EA', color: '#2E9E62' },
    A03: { glyph: '✎', background: '#FFF0DC', color: '#E8742A' },
  })[id] ?? { image: episodeThumb[id], background: '#FFF1E4' }
