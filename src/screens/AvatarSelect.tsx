import { useState } from 'react'
import { avatarArt, devkitArt } from '@/design/devkitAssets'
import { useProfile, type AvatarId } from '@/services/profile'

const avatars: { id: AvatarId; label: string }[] = [
  { id: 'sun', label: '노랑 탐험가' },
  { id: 'sky', label: '하늘 탐험가' },
  { id: 'leaf', label: '초록 탐험가' },
  { id: 'peach', label: '복숭아 탐험가' },
]

export function AvatarSelect() {
  const chooseAvatar = useProfile((state) => state.chooseAvatar)
  const [selected, setSelected] = useState<AvatarId>('sun')
  return (
    <main className="explore-avatar-page">
      <section className="explore-avatar-panel" aria-labelledby="avatar-title">
        <div className="explore-small-mark" aria-hidden="true">
          ✦
        </div>
        <h1 id="avatar-title">나의 탐험가를 골라요</h1>
        <p>마음에 드는 캐릭터를 고르세요. 이름은 적지 않아도 돼요.</p>
        <div className="explore-avatar-preview" data-avatar={selected} aria-hidden="true">
          <img src={selected === 'sun' ? devkitArt.haruFull : avatarArt[selected]} alt="" />
        </div>
        <div className="explore-avatar-options" role="group" aria-label="탐험가 선택">
          {avatars.map((avatar) => (
            <button
              key={avatar.id}
              type="button"
              data-avatar={avatar.id}
              aria-pressed={selected === avatar.id}
              onClick={() => setSelected(avatar.id)}
            >
              <img src={avatarArt[avatar.id]} alt="" />
              <span>{avatar.label}</span>
            </button>
          ))}
        </div>
        <button type="button" className="explore-primary" onClick={() => chooseAvatar(selected)}>
          다음 <span aria-hidden="true">›</span>
        </button>
      </section>
    </main>
  )
}
