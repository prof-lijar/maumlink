import { useT } from '@/i18n/useT'
import { useSettings, type Avatar } from '@/services/settings'
import { art, sprite } from './art'
import { cn } from './cn'

interface Props {
  /** Defaults to the companion the child chose. */
  avatar?: Avatar
  /** `full` shows the whole body; `bust` crops the picture to head and shoulders. */
  variant?: 'full' | 'bust'
  className?: string
  animate?: boolean
  /** Inside a control that already names the character, the picture is decorative. */
  decorative?: boolean
}

/** The chosen companion character (하루 · 소라 · 미나 · 준). */
export function CharacterArt({ avatar, variant = 'full', className, animate, decorative }: Props) {
  const { t } = useT()
  const chosen = useSettings((s) => s.avatar)
  const id = avatar ?? chosen
  return (
    <span
      className={cn(
        'character-art',
        variant === 'bust' ? 'character-art--bust' : 'character-art--full',
        animate && 'character-art--bob',
        className,
      )}
      data-avatar={id}
    >
      <img
        {...sprite(art.character(id, 400), art.character(id, 800))}
        alt={decorative ? '' : t(`character.${id}`)}
        width={400}
        height={600}
        decoding="async"
      />
    </span>
  )
}
