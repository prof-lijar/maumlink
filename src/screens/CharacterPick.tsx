import { CharacterArt } from '@/design/CharacterArt'
import { PrimaryButton } from '@/design/Button'
import { ArrowRightIcon, CheckIcon } from '@/design/icons'
import { cn } from '@/design/cn'
import { useT } from '@/i18n/useT'
import { AVATARS, useSettings, type Avatar } from '@/services/settings'
import { sound } from '@/services/sound'
import { useSpeak } from '@/services/useSpeak'

/** Radio row of the four companions; shared by the first-run screen and Settings. */
export function CharacterPicker({ compact }: { compact?: boolean }) {
  const { t } = useT()
  const avatar = useSettings((s) => s.avatar)
  const setAvatar = useSettings((s) => s.setAvatar)
  const { speak } = useSpeak()
  const pick = (id: Avatar) => {
    sound.play('tick')
    setAvatar(id)
    void speak(t(`character.${id}`))
  }
  return (
    <div
      role="radiogroup"
      aria-label={t('character.title')}
      className={cn('character-grid', compact && 'character-grid--compact')}
    >
      {AVATARS.map((id) => {
        const on = id === avatar
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={on}
            data-avatar={id}
            className="character-option tap"
            onKeyDown={(event) => {
              if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
              event.preventDefault()
              const i = AVATARS.indexOf(id)
              const next =
                event.key === 'Home'
                  ? 0
                  : event.key === 'End'
                    ? AVATARS.length - 1
                    : (i + (event.key === 'ArrowRight' ? 1 : -1) + AVATARS.length) % AVATARS.length
              pick(AVATARS[next]!)
              event.currentTarget.parentElement
                ?.querySelector<HTMLButtonElement>(`[data-avatar="${AVATARS[next]}"]`)
                ?.focus()
            }}
            onClick={() => pick(id)}
          >
            <CharacterArt avatar={id} variant="bust" decorative />
            <span className="character-name">{t(`character.${id}`)}</span>
            {on && (
              <span className="character-check" aria-hidden="true">
                <CheckIcon size={18} />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/** First-run step after Start: choose the companion who appears on Home and at wrap-up. */
export function CharacterPick({ onDone }: { onDone: () => void }) {
  const { t } = useT()
  const avatar = useSettings((s) => s.avatar)
  return (
    <main className="character-screen">
      <div className="character-copy">
        <h1 className="character-title">{t('character.title')}</h1>
        <p className="text-body text-ink-soft">{t('character.hint')}</p>
      </div>
      <div className="character-stage" aria-live="polite">
        <span className="character-halo" aria-hidden="true" />
        <CharacterArt key={avatar} avatar={avatar} className="character-hero" animate />
      </div>
      <CharacterPicker />
      <PrimaryButton
        className="character-action"
        iconRight={<ArrowRightIcon />}
        onClick={onDone}
        data-testid="character-next"
      >
        {t('nav.next')}
      </PrimaryButton>
    </main>
  )
}
