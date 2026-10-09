import { useEffect, useEffectEvent, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useT } from '@/i18n/useT'
import { cn } from './cn'
import { SecondaryButton } from './Button'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  tint?: string
  /** When true the sheet cannot be dismissed by backdrop tap (used for confirm). */
  modal?: boolean
}

/**
 * Bottom sheet on phones/tablets, centered dialog ≥ lg (PRD §6.2.1 table).
 * Traps focus minimally (first focusable on open, Escape closes, restores focus).
 */
export function Sheet({ open, onClose, title, children, tint, modal }: Props) {
  const { t } = useT()
  const id = useId()
  const panel = useRef<HTMLDivElement>(null)
  const restore = useRef<HTMLElement | null>(null)

  const close = useEffectEvent(onClose)

  useEffect(() => {
    if (!open) return
    // The sheet is portaled to <body>; everything in the app root becomes inert while it is open.
    const app = document.getElementById('root')
    const wasInert = app?.hasAttribute('inert')
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    app?.setAttribute('inert', '')
    restore.current = document.activeElement as HTMLElement | null
    const first = panel.current?.querySelector<HTMLElement>(
      'button, [href], [tabindex]:not([tabindex="-1"])',
    )
    first?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
      }
      if (e.key === 'Tab' && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])',
        )
        if (f.length === 0) return
        const firstEl = f[0]!
        const lastEl = f[f.length - 1]!
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault()
          lastEl.focus()
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault()
          firstEl.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      if (!wasInert) app?.removeAttribute('inert')
      restore.current?.focus?.()
    }
  }, [open])

  if (!open) return null
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center lg:items-center"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-ink/35 motion-safe:animate-[fadeIn_200ms_ease-out]"
        onClick={modal ? undefined : onClose}
        aria-hidden="true"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        className={cn(
          'app-sheet relative flex max-h-[85dvh] w-full flex-col rounded-t-card bg-surface pb-safe motion-safe:animate-[slideUp_240ms_ease-out] md:max-h-[85dvh] lg:max-h-[80dvh] lg:w-[600px] lg:rounded-card',
        )}
        style={tint ? { backgroundColor: tint } : undefined}
      >
        <div
          className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-line lg:hidden"
          aria-hidden="true"
        />
        <div className="sheet-heading flex shrink-0 items-center justify-between gap-4 px-5 pt-3">
          <h2 id={`${id}-title`} className="text-body font-bold text-ink">
            {title}
          </h2>
          {!modal && <SecondaryButton onClick={onClose}>{t('nav.close')}</SecondaryButton>}
        </div>
        <div className="min-h-0 overflow-y-auto px-5 pb-6 pt-3">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
