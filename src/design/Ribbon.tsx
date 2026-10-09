import type { ReactNode } from 'react'
import { cn } from './cn'
import { StarIcon } from './icons'

/** Sunny banner for a cheer ("잘했어요!") or a gentle nudge; sparkles are decorative only. */
export function Ribbon({
  children,
  tone = 'sun',
  className,
  ...rest
}: {
  children: ReactNode
  tone?: 'sun' | 'pink'
  className?: string
  'data-testid'?: string
}) {
  return (
    <div className={cn('ribbon', `ribbon--${tone}`, className)} {...rest}>
      <span className="ribbon-star ribbon-star--left" aria-hidden="true">
        <StarIcon size={28} />
      </span>
      <span className="ribbon-text">{children}</span>
      <span className="ribbon-star ribbon-star--right" aria-hidden="true">
        <StarIcon size={22} />
      </span>
    </div>
  )
}
