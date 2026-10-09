import type { HTMLAttributes, ReactNode } from 'react'
import type { Domain } from '@/content/schema'
import { cn } from './cn'
import { BulbIcon } from './icons'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  label?: ReactNode
  domain?: Domain
  /** `lesson` is the yellow "오늘의 배움" style with a light-bulb badge. */
  tone?: 'surface' | 'domain' | 'lesson'
}

/** Quiet informational surface; shared theme tokens separate it from selectable choices. */
export function Card({ label, domain, tone = 'surface', className, children, ...rest }: CardProps) {
  return (
    <div
      data-domain-tone={tone === 'domain' ? domain : undefined}
      className={cn('content-panel', tone === 'lesson' && 'content-panel--lesson', className)}
      {...rest}
    >
      {label && (
        <div className="content-panel-label">
          {tone === 'lesson' && (
            <span className="content-panel-bulb" aria-hidden="true">
              <BulbIcon size={22} />
            </span>
          )}
          {label}
        </div>
      )}
      {children}
    </div>
  )
}
