import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import inventory from '../../content-source/narration/inventory.json'
import { activeNarrationVoice, NARRATION_VOICES } from '../../src/services/narration/voices'
import { resolveRecordedNarration } from '../../src/services/recordedNarration'

describe('recorded narration', () => {
  const clips = [
    { text: '속상해요', url: '/feeling.mp3' },
    { text: '친구의 마음을 살펴봐요.', url: '/reason.mp3' },
  ]

  it('assembles dynamic narration using complete phrases in order', () => {
    expect(resolveRecordedNarration('“속상해요”. 친구의 마음을 살펴봐요.', 'ko', clips)).toEqual([
      '/feeling.mp3',
      '/reason.mp3',
    ])
  })

  it('never drops unknown text, matches partial words, or uses Korean clips for English', () => {
    expect(resolveRecordedNarration('속상해요. 새로운 문장이에요.', 'ko', clips)).toBeUndefined()
    expect(resolveRecordedNarration('속상해요라는 말', 'ko', clips)).toBeUndefined()
    expect(resolveRecordedNarration('속상해요', 'en', clips)).toBeUndefined()
  })

  it('ships every registered MP3 of every voice set inside public', () => {
    for (const voice of Object.values(NARRATION_VOICES)) {
      expect(voice.audioDir).toMatch(/^\/audio\/[a-z-]+$/)
      for (const clip of voice.clips) {
        expect(clip.url.startsWith(`${voice.audioDir}/`), clip.url).toBe(true)
        expect(existsSync(`public${clip.url}`), clip.url).toBe(true)
      }
    }
  })

  it('ships the kid voice by default and keeps the adult Kyung set switchable', () => {
    expect(activeNarrationVoice.id).toBe('lulu-lolipop')
    expect(Object.keys(NARRATION_VOICES)).toEqual([
      'kyung',
      'sophie-lane',
      'clova-ndain',
      'lulu-lolipop',
    ])
    expect(NARRATION_VOICES.kyung.clips.length).toBeGreaterThan(100)
    for (const voice of Object.values(NARRATION_VOICES))
      expect(voice.playbackRate).toBeGreaterThanOrEqual(0.7)
  })

  it('records every current phrase in the shipped voice, including spelling corrections', () => {
    const missing = inventory.clips.filter(
      (phrase) => !resolveRecordedNarration(phrase.text, 'ko', activeNarrationVoice.clips),
    )
    expect(missing.map((phrase) => phrase.text)).toEqual([])
    // Reviewed sentences that were recorded for 1.0 are still spoken by the recording.
    expect(
      resolveRecordedNarration('눈물이 나온다, 고개가 숙여진다, 몸에 힘이 빠진다.', 'ko'),
    ).toHaveLength(1)
  })

  it('assembles the Step 3 opening and the ending recap from recorded phrases', () => {
    // The learning objective is shown but never read (narratePrinciple: false).
    const opening =
      "'화가 나요'를 골랐어요. 그때 내 몸의 반응은 어떤가요? 머리에 열이 오르고 눈이 뜨거워지고, 목소리가 커진다."
    expect(resolveRecordedNarration(opening, 'ko')).toHaveLength(3)
    const recap =
      '오늘의 길 속상해요 내가 고른 방법. 조용한 곳에 잠시 혼자 있기. 숨을 크게 내쉬어보기'
    expect(resolveRecordedNarration(recap, 'ko')).toHaveLength(5)
  })
})
