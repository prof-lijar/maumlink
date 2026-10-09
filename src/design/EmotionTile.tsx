import { useState } from 'react'
import type { Emotion } from '@/content/schema'
import { useT } from '@/i18n/useT'
import { sound } from '@/services/sound'
import { art, sprite } from './art'
import { cn } from './cn'
import { CheckIcon } from './icons'

interface Props {
  emotion: Emotion
  selected: boolean
  dimmed?: boolean
  onSelect: (id: string) => void
  size?: 'normal' | 'compact'
}

/**
 * Cartoon face card + word (PRD §6.7). Tapping speaks the word (parent handles) and toggles.
 * Selected = blue outline and a check badge without layout movement.
 */
export function EmotionTile({ emotion, selected, dimmed, onSelect, size = 'normal' }: Props) {
  const { L, t } = useT()
  const word = L(emotion.word)
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      aria-label={word}
      data-emotion={emotion.id}
      className={cn(
        'emotion-tile tap',
        size === 'compact' && 'emotion-tile--compact',
        dimmed && !selected && 'opacity-60',
      )}
      style={{ ['--tile-tint' as string]: emotion.tint }}
      onClick={() => {
        sound.play('tick')
        onSelect(emotion.id)
      }}
    >
      <EmotionFace emotion={emotion} className="emotion-face" />
      <span className="emotion-word">{word}</span>
      {selected && (
        <span className="emotion-check" aria-hidden="true">
          <CheckIcon size={20} />
          <span className="sr-only">{t('feeling.selected')}</span>
        </span>
      )}
    </button>
  )
}

/** Cartoon face for an emotion; the original line icon stays as a fallback. */
export function EmotionFace({ emotion, className }: { emotion: Emotion; className?: string }) {
  const [fallback, setFallback] = useState(false)
  return (
    <span className={cn('emotion-face-frame', className)} aria-hidden="true">
      {fallback ? (
        <img src={`/icons/emotions/${emotion.icon}`} alt="" width={64} height={64} />
      ) : (
        <img
          {...sprite(art.face(emotion.id, 400), art.face(emotion.id, 800))}
          alt=""
          width={400}
          height={400}
          decoding="async"
          onError={() => setFallback(true)}
        />
      )}
    </span>
  )
}
