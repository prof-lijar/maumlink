/**
 * Settings store — PRD §11.4. Persisted to localStorage; Korean-only shipped locale (D17):
 * `locale` is only ever changed by the dev `?lang=en` URL flag and is never persisted as 'en'.
 */
import { create } from 'zustand'
import { z } from 'zod'
import { persist } from 'zustand/middleware'
import { speech } from './speech'

export type TextSize = 'normal' | 'large'
export type Locale = 'ko' | 'en'
/** The child's companion character on Home / wrap-up (cartoon redesign 2026-10-09). */
export const AVATARS = ['haru', 'sora', 'mina', 'jun'] as const
export type Avatar = (typeof AVATARS)[number]

interface SettingsState {
  textSize: TextSize
  sound: boolean
  autoRead: boolean
  voiceEnabled: boolean
  started: boolean
  avatar: Avatar
  locale: Locale
  setTextSize: (v: TextSize) => void
  setSound: (v: boolean) => void
  setAutoRead: (v: boolean) => void
  setVoiceEnabled: (v: boolean) => void
  setStarted: () => void
  setAvatar: (v: Avatar) => void
  setLocale: (v: Locale) => void
}

function devLocaleFromUrl(): Locale {
  if (typeof window === 'undefined') return 'ko'
  return new URLSearchParams(window.location.search).get('lang') === 'en' ? 'en' : 'ko'
}

export const StoredSettings = z
  .object({
    textSize: z.enum(['normal', 'large']).catch('normal'),
    sound: z.boolean().catch(true),
    autoRead: z.boolean().catch(true),
    voiceEnabled: z.boolean().catch(true),
    started: z.boolean().catch(false),
    avatar: z.enum(AVATARS).catch('haru'),
  })
  .catch({
    textSize: 'normal',
    sound: true,
    autoRead: true,
    voiceEnabled: true,
    started: false,
    avatar: 'haru',
  })

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      textSize: 'normal',
      sound: true,
      autoRead: true,
      voiceEnabled: true,
      started: false,
      avatar: 'haru',
      locale: devLocaleFromUrl(),
      setTextSize: (textSize) => set({ textSize }),
      setSound: (sound) => set({ sound }),
      setAutoRead: (autoRead) => set({ autoRead }),
      setVoiceEnabled: (voiceEnabled) => set({ voiceEnabled }),
      setStarted: () => set({ started: true }),
      setAvatar: (avatar) => set({ avatar }),
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'maumlink.settings.v1',
      partialize: (s) => ({
        textSize: s.textSize,
        sound: s.sound,
        autoRead: s.autoRead,
        voiceEnabled: s.voiceEnabled,
        started: s.started,
        avatar: s.avatar,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...StoredSettings.parse(persisted),
        locale: devLocaleFromUrl(),
      }),
    },
  ),
)

// Apply the restored preference before any screen can narrate; keep changes synchronous.
speech.setEnabled(useSettings.getState().voiceEnabled)
useSettings.subscribe((state, previous) => {
  if (state.voiceEnabled !== previous.voiceEnabled) speech.setEnabled(state.voiceEnabled)
})
