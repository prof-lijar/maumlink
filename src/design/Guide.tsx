import type { ElementType, ReactNode } from 'react'
import { useT } from '@/i18n/useT'
import { art, sprite, type GuidePose } from './art'
import { cn } from './cn'

/** 마음이, the puppy guide: a small round portrait used beside every question and feedback. */
export function GuideAvatar({
  pose = 'wave',
  size = 'md',
  className,
}: {
  pose?: GuidePose
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const { t } = useT()
  return (
    <span className={cn('guide-avatar', `guide-avatar--${size}`, className)} data-pose={pose}>
      <img
        {...sprite(art.guide(pose, 400), art.guide(pose, 800))}
        alt={t('guide.name')}
        width={400}
        height={400}
        decoding="async"
      />
    </span>
  )
}

interface BubbleProps {
  children: ReactNode
  pose?: GuidePose
  /** Heading level for the spoken question; tests and screen readers rely on the h1. */
  as?: ElementType
  className?: string
  tone?: 'surface' | 'sun'
  'aria-live'?: 'polite' | 'off'
  'data-testid'?: string
}

/** The guide speaks: portrait on the left, rounded white bubble with the text on the right. */
export function GuideBubble({
  children,
  pose = 'point',
  as: Tag = 'h1',
  className,
  tone = 'surface',
  ...rest
}: BubbleProps) {
  return (
    <div className={cn('guide-bubble', tone === 'sun' && 'guide-bubble--sun', className)}>
      <GuideAvatar pose={pose} />
      <Tag className="guide-bubble-text" {...rest}>
        {children}
      </Tag>
    </div>
  )
}
