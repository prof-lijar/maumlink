import { useEffect, useEffectEvent, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { episodeThumb } from '@/design/devkitAssets'
import { useAutoRead } from '@/services/useSpeak'
import { Cta } from './gameParts'
import { STORY_DIALOG_COPY as COPY, type StoryDialogMode } from './storyDialogCopy'

export type { StoryDialogMode } from './storyDialogCopy'

/**
 * Asked on the story list before a half-done story resumes (이어서 / 처음부터) or a finished one
 * replays (처음부터 / 아니요). Backdrop tap and Escape are the same as 아니요.
 */
export function StoryDialog({
  mode,
  episodeId,
  storyTitle,
  onContinue,
  onRestart,
  onClose,
}: {
  mode: StoryDialogMode
  episodeId: string
  storyTitle: string
  onContinue: () => void
  onRestart: () => void
  onClose: () => void
}) {
  const id = useId()
  const card = useRef<HTMLDivElement>(null)
  const restore = useRef<HTMLElement | null>(null)
  const copy = COPY[mode]
  const close = useEffectEvent(onClose)
  useAutoRead(`${copy.title} ${copy.body}`, `story-dialog:${mode}:${episodeId}`)

  useEffect(() => {
    const app = document.getElementById('root')
    const wasInert = app?.hasAttribute('inert')
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    app?.setAttribute('inert', '')
    restore.current = document.activeElement as HTMLElement | null
    card.current?.querySelector<HTMLElement>('button')?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }
      if (event.key !== 'Tab' || !card.current) return
      const buttons = card.current.querySelectorAll<HTMLElement>('button')
      const first = buttons[0]
      const last = buttons[buttons.length - 1]
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      if (!wasInert) app?.removeAttribute('inert')
      restore.current?.focus?.()
    }
  }, [])

  return createPortal(
    <div className="garden-dialog" role="presentation">
      <div className="garden-dialog__backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={card}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-body`}
        className="garden-dialog__card"
      >
        <img className="garden-dialog__thumb" src={episodeThumb[episodeId]} alt="" />
        <span className="garden-dialog__story">{storyTitle}</span>
        <h2 id={`${id}-title`} className="garden-dialog__title">
          {copy.title}
        </h2>
        <p id={`${id}-body`} className="garden-dialog__body">
          {copy.body}
        </p>
        <div className="garden-dialog__actions">
          <Cta onClick={mode === 'in_progress' ? onContinue : onRestart}>{copy.primary}</Cta>
          <button
            type="button"
            className="garden-finish__again"
            onClick={mode === 'in_progress' ? onRestart : onClose}
          >
            {copy.secondary}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
