import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { z } from 'zod'

export const avatarIds = ['sun', 'sky', 'leaf', 'peach'] as const
export type AvatarId = (typeof avatarIds)[number]

interface ProfileState {
  avatarId: AvatarId | null
  chooseAvatar: (id: AvatarId) => void
}

const StoredProfile = z.object({ avatarId: z.enum(avatarIds).nullable().catch(null) }).catch({
  avatarId: null,
})

export const useProfile = create<ProfileState>()(
  persist((set) => ({ avatarId: null, chooseAvatar: (avatarId) => set({ avatarId }) }), {
    name: 'maumlink.profile.mvp-v1',
    partialize: (state) => ({ avatarId: state.avatarId }),
    merge: (stored, current) => ({ ...current, ...StoredProfile.parse(stored) }),
  }),
)
