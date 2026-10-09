import type { ReactNode } from 'react'
import type { Domain, OptionId } from '@/content/schema'
import { useT } from '@/i18n/useT'
import { sound } from '@/services/sound'
import { cn } from './cn'
import { CheckIcon, SpeakerIcon } from './icons'

interface Props {
  id: OptionId
  domain: Domain
  text: string
  selected: boolean
  dimmed?: boolean
  /** Outcome pictogram name (public/icons/outcome/<name>.svg) shown in the badge. */
  icon?: string
  onSelect: (id: OptionId) => void
  onSpeak: () => void
  children?: ReactNode
}

/** Action / multiple-choice card (PRD §6.7): picture badge, text, speaker; min 96 px tall. */
export function ChoiceCard({
  id,
  domain,
  text,
  selected,
  dimmed,
  icon,
  onSelect,
  onSpeak,
  children,
}: Props) {
  const { t } = useT()
  return (
    <div
      data-selected={selected}
      data-domain-tone={domain}
      className={cn('choice-card', dimmed && !selected && 'choice-card--tried')}
    >
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        data-option={id}
        className="choice-main tap"
        onKeyDown={(event) => {
          if (
            !['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)
          )
            return
          const options = Array.from(
            event.currentTarget
              .closest('[role="radiogroup"]')
              ?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ?? [],
          )
          if (!options.length) return
          event.preventDefault()
          const i = options.indexOf(event.currentTarget)
          const next =
            event.key === 'Home'
              ? 0
              : event.key === 'End'
                ? options.length - 1
                : (i +
                    (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) +
                    options.length) %
                  options.length
          options[next]?.focus()
          options[next]?.click()
        }}
        onClick={() => {
          sound.play('tick')
          onSelect(id)
        }}
      >
        <span className="choice-letter" aria-hidden="true">
          {selected ? (
            <CheckIcon size={28} />
          ) : icon ? (
            <img src={`/icons/outcome/${icon}.svg`} alt="" width={36} height={36} />
          ) : (
            id
          )}
        </span>
        <span className="choice-text">{text}</span>
      </button>
      <button
        type="button"
        aria-label={t('a11y.speak')}
        title={text}
        className="choice-speaker tap"
        onClick={onSpeak}
      >
        <SpeakerIcon size={26} />
      </button>
      {children && <div className="choice-ack">{children}</div>}
    </div>
  )
}
