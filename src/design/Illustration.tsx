import type { ReactNode } from 'react'
import type { Domain } from '@/content/schema'
import { useT } from '@/i18n/useT'
import { cn } from './cn'
import { domainSurface } from './domain'

interface Props {
  /** Base path without size suffix/extension, e.g. "/img/social-playground" — or undefined for placeholder. */
  src?: string
  alt: string
  brief?: string
  domain: Domain
  className?: string
  /** Overlays positioned in the same 16:10 frame as the picture (e.g. speech bubbles). */
  children?: ReactNode
}

/**
 * Situation illustration with srcset (FR-RES-06) in a fixed 16:10 frame so layout never
 * shifts; falls back to a domain-tinted placeholder carrying the written brief (FR-S1-03, D9).
 */
export function Illustration({ src, alt, brief, domain, className, children }: Props) {
  const { t } = useT()
  return (
    <div
      className={cn(
        'story-illustration relative aspect-[16/10] w-full overflow-hidden rounded-card',
        src ? 'bg-surface' : domainSurface[domain],
        className,
      )}
    >
      {src ? (
        <img
          src={`${src}.png`}
          srcSet={`${src}-800.webp 800w, ${src}-1600.webp 1600w`}
          sizes="(min-width: 1024px) 50vw, 100vw"
          width={1600}
          height={1000}
          alt={alt}
          decoding="async"
          className="size-full object-contain"
        />
      ) : (
        <div
          className="flex size-full flex-col items-center justify-center gap-3 p-6 text-center"
          role="img"
          aria-label={alt}
        >
          <img
            src={`/icons/domain/${domain}.svg`}
            alt=""
            width={96}
            height={96}
            className="size-24 opacity-70"
          />
          <span className="text-body font-bold text-ink">{t('image.placeholder')}</span>
          {brief && <span className="max-w-[48ch] text-caption text-ink">{brief}</span>}
        </div>
      )}
      {children}
    </div>
  )
}
