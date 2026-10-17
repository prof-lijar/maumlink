import { describe, expect, it } from 'vitest'
import { resolveL, resolveT } from '../../src/i18n/useT'

describe('i18n', () => {
  it('resolves Korean by default and interpolates params', () => {
    expect(resolveT('home.count', 'ko', { n: 3 })).toBe('상황 3개')
    expect(resolveT('feeling.chose', 'ko', { emotion: '속상해요' })).toBe('‘속상해요’를 골랐어요.')
  })
  it('resolves English when present and falls back to Korean when missing (D17)', () => {
    expect(resolveT('nav.next', 'en')).toBe('Next')
    expect(resolveL({ ko: '한국어만' }, 'en')).toBe('한국어만')
    expect(resolveL({ ko: '한국어', en: 'English' }, 'en')).toBe('English')
  })
  it('returns the key for unknown ui ids (never throws in front of a child)', () => {
    expect(resolveT('does.not.exist', 'ko')).toBe('does.not.exist')
  })
})
