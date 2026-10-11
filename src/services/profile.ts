import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { z } from 'zod'

/** The companion the child picks on first run (하루 · 소라 · 미나 · 준). */
export const avatarIds = ['haru', 'sora', 'mina', 'jun'] as const
export type AvatarId = (typeof avatarIds)[number]

interface ProfileState {
  avatarId: AvatarId | null
  chooseAvatar: (id: AvatarId) => void
}

/** Installs from the devkit build stored colour names; keep that choice. */
const legacyAvatar: Record<string, AvatarId> = {
  sun: 'haru',
  sky: 'sora',
  leaf: 'mina',
  peach: 'jun',
}
const StoredProfile = z
  .object({
    avatarId: z
      .string()
      .nullable()
      .transform((id) => (id && (legacyAvatar[id] ?? id)) || null)
      .pipe(z.enum(avatarIds).nullable())
      .catch(null),
  })
  .catch({ avatarId: null })

export const useProfile = create<ProfileState>()(
  persist((set) => ({ avatarId: null, chooseAvatar: (avatarId) => set({ avatarId }) }), {
    name: 'maumlink.profile.mvp-v1',
    partialize: (state) => ({ avatarId: state.avatarId }),
    merge: (stored, current) => ({ ...current, ...StoredProfile.parse(stored) }),
  }),
)
