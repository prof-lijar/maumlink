import { useState } from 'react'
import { avatarArt, avatarArtLarge, avatarNames } from '@/design/devkitAssets'
import { CheckIcon } from '@/design/icons'
import { avatarIds, useProfile, type AvatarId } from '@/services/profile'

/** First-run companion pick (1.0 layout): big character on a sunny circle, four face cards. */
export function AvatarSelect() {
  const chooseAvatar = useProfile((state) => state.chooseAvatar)
  const [selected, setSelected] = useState<AvatarId>('haru')
  return (
    <main className="pick-page">
      <h1 className="pick-title">나의 캐릭터를 선택해요!</h1>
      <p className="pick-hint">마음잇다에서 함께 다닐 친구예요.</p>
      <div className="pick-stage" aria-hidden="true">
        <img src={avatarArtLarge[selected]} alt="" width={800} height={1200} decoding="async" />
      </div>
      <div className="pick-options" role="radiogroup" aria-label="캐릭터 선택">
        {avatarIds.map((id) => {
          const on = selected === id
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={on}
              className="pick-option"
              data-avatar={id}
              onClick={() => setSelected(id)}
            >
              <span className="pick-option__face">
                <img src={avatarArt[id]} alt="" width={400} height={600} />
              </span>
              <span className="pick-option__name">{avatarNames[id]}</span>
              {on && (
                <span className="pick-option__check" aria-hidden="true">
                  <CheckIcon size={20} />
                </span>
              )}
            </button>
          )
        })}
      </div>
      <button type="button" className="pick-next" onClick={() => chooseAvatar(selected)}>
        다음
        <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M4 12h15M13 6l6 6-6 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </main>
  )
}
