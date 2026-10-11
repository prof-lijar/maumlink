import type { ReactNode } from 'react'
import type { Domain, OptionId } from '@/content/schema'
import { useT } from '@/i18n/useT'
import { sound } from '@/services/sound'
import { cn } from './cn'
import { CheckIcon, GardenSpeakerIcon, SpeakerIcon } from './icons'

const badgeTint: Record<Domain, string> = {
  self: 'bg-domain-self text-ink',
  social: 'bg-domain-social text-ink',
  relation: 'bg-domain-relation text-ink',
  mind: 'bg-domain-mind text-ink',
  reserved: 'bg-domain-reserved text-ink',
}

interface Props {
  id: OptionId
  domain?: Domain
  text: string
  illustrationSrc?: string
  selected: boolean
  dimmed?: boolean
  onSelect: (id: OptionId) => void
  /** Omit to hide the per-card speaker (the life-garden game has no voice buttons). */
  onSpeak?: () => void
  children?: ReactNode
  /** `garden` renders the life-garden handoff card (letter badge, orange selection). */
  variant?: 'storybook' | 'garden'
}

/** Action / multiple-choice card (PRD §6.7): letter badge, text, speaker; min 96 px tall. */
export function ChoiceCard({
  id,
  domain,
  text,
  illustrationSrc,
  selected,
  dimmed,
  onSelect,
  onSpeak,
  children,
  variant = 'storybook',
}: Props) {
  const { t } = useT()
  const garden = variant === 'garden'
  return (
    <div
      data-selected={selected}
      className={cn(
        garden
          ? 'garden-choice'
          : 'choice-card relative flex min-h-[96px] flex-wrap items-stretch rounded-card border-2 bg-surface transition-[border-color,transform] duration-150 motion-reduce:transition-none lg:min-h-[120px]',
        !garden && (selected ? 'border-select ring-2 ring-select' : 'border-line'),
        !garden && dimmed && !selected && 'bg-bg',
        !garden && illustrationSrc && 'choice-card--illustrated',
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        data-option={id}
        className={
          garden
            ? 'garden-choice__pick'
            : 'tap min-w-0 flex flex-1 items-center gap-3 px-4 py-4 text-left md:px-5'
        }
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
        {garden ? (
          <span className="garden-choice__key" aria-hidden="true">
            {id}
          </span>
        ) : illustrationSrc ? (
          <img className="choice-card__illustration" src={illustrationSrc} alt="" />
        ) : (
          <span
            className={cn(
              'choice-letter flex size-12 shrink-0 items-center justify-center text-btn font-bold',
              domain ? badgeTint[domain] : 'bg-domain-social text-ink',
            )}
            aria-hidden="true"
          >
            {selected ? <CheckIcon size={26} /> : id}
          </span>
        )}
        <span className={garden ? 'garden-choice__text' : 'flex-1 text-body text-ink'}>{text}</span>
      </button>
      {onSpeak && (
        <button
          type="button"
          aria-label={t('a11y.speak')}
          title={text}
          className={
            garden
              ? 'garden-speak'
              : 'choice-speaker tap flex shrink-0 items-center justify-center self-center text-ink-soft'
          }
          onClick={onSpeak}
        >
          {garden ? <GardenSpeakerIcon color="#E8742A" /> : <SpeakerIcon size={26} />}
        </button>
      )}
      {children && <div className="choice-ack basis-full text-body text-ink-soft">{children}</div>}
    </div>
  )
}
