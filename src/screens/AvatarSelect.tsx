import { useState } from 'react'
import { avatarArt, avatarArtLarge, avatarNames } from '@/design/devkitAssets'
import { avatarIds, useProfile, type AvatarId } from '@/services/profile'

export function AvatarSelect() {
  const chooseAvatar = useProfile((state) => state.chooseAvatar)
  const [selected, setSelected] = useState<AvatarId>('haru')
  return (
    <main className="explore-avatar-page">
      <section className="explore-avatar-panel" aria-labelledby="avatar-title">
        <div className="explore-small-mark" aria-hidden="true">
          ✦
        </div>
        <h1 id="avatar-title">나의 탐험가를 골라요</h1>
        <p>마음에 드는 캐릭터를 고르세요. 이름은 적지 않아도 돼요.</p>
        <div className="explore-avatar-preview" data-avatar={selected} aria-hidden="true">
          <img src={avatarArtLarge[selected]} alt="" width={800} height={1200} />
        </div>
        <div className="explore-avatar-options" role="group" aria-label="탐험가 선택">
          {avatarIds.map((id) => (
            <button
              key={id}
              type="button"
              data-avatar={id}
              aria-pressed={selected === id}
              onClick={() => setSelected(id)}
            >
              <img src={avatarArt[id]} alt="" width={400} height={600} />
              <span>{avatarNames[id]}</span>
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
