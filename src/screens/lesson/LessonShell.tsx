import { useEffect, useRef, type ReactNode } from 'react'
import { IconButton, PrimaryButton, SecondaryButton } from '@/design/Button'
import { VoiceToggle } from '@/design/VoiceToggle'
import { ProgressLink } from '@/design/ProgressLink'
import { ArrowLeftIcon, ArrowRightIcon, HomeIcon, SettingsIcon } from '@/design/icons'
import { useT } from '@/i18n/useT'
import type { Domain } from '@/content/schema'

export interface BottomBar {
  back?: { label: string; onClick: () => void }
  primary: { label: string; onClick: () => void; softDisabled?: boolean; icon?: ReactNode }
  /** Optional third control (Help / Tell me more / Try another way). */
  extra?: ReactNode
}

interface Props {
  progressIndex: number
  onHome: () => void
  onSettings: () => void
  onReplay: () => void
  ttsSupported: boolean
  bottom: BottomBar
  children: ReactNode
  /** Key that changes per screen to replay the slide-in transition. */
  screenKey: string
  /** Step caption under the progress track; defaults to the generic label for the step. */
  stepTitle?: string
  /** Learning area, used to tint the backdrop. */
  domain?: Domain
}

/**
 * Fixed chrome for every lesson screen (PRD §6.2): top bar (Home · progress · speaker/settings),
 * viewport-sized workspace and single-row navigation; overflow remains available for text zoom.
 */
export function LessonShell({
  progressIndex,
  onHome,
  onSettings,
  onReplay,
  ttsSupported,
  bottom,
  children,
  screenKey,
  stepTitle,
  domain,
}: Props) {
  const { t } = useT()
  const content = useRef<HTMLElement>(null)
  useEffect(() => {
    content.current?.scrollTo?.({ top: 0 })
    const heading = content.current?.querySelector('h1')
    heading?.setAttribute('tabindex', '-1')
    heading?.focus({ preventScroll: true })
  }, [screenKey])
  return (
    <div className="lesson-shell flex h-dvh flex-col text-ink" data-domain={domain}>
      <header className="lesson-header flex shrink-0 items-center justify-between gap-4">
        <div className="flex items-center">
          <IconButton label={t('nav.home')} onClick={onHome}>
            <HomeIcon />
          </IconButton>
          <span className="lesson-brand">{t('app.name')}</span>
        </div>
        <div className="lesson-progress">
          <ProgressLink index={progressIndex} />
          <span className="progress-caption">{stepTitle ?? t(`step.${screenKey}`)}</span>
        </div>
        <div className="flex items-center gap-4">
          <VoiceToggle onEnable={onReplay} supported={ttsSupported} />
          <IconButton label={t('nav.settings')} onClick={onSettings}>
            <SettingsIcon />
          </IconButton>
        </div>
      </header>

      <main
        data-screen={screenKey}
        ref={content}
        key={screenKey}
        className="lesson-content mx-auto flex min-h-0 w-full max-w-[1280px] flex-1 flex-col overflow-y-auto motion-safe:animate-[slideIn_240ms_ease-out]"
      >
        {children}
      </main>

      <footer className="lesson-footer shrink-0">
        <div className="lesson-navigation">
          {bottom.back && (
            <SecondaryButton
              quiet
              icon={<ArrowLeftIcon size={26} />}
              onClick={bottom.back.onClick}
              data-testid="nav-back"
            >
              {bottom.back.label}
            </SecondaryButton>
          )}
          {bottom.extra && <div className="lesson-navigation-extra">{bottom.extra}</div>}
          <PrimaryButton
            quiet
            data-testid="nav-primary"
            softDisabled={bottom.primary.softDisabled}
            onClick={bottom.primary.onClick}
            icon={bottom.primary.icon}
            iconRight={bottom.primary.icon ? undefined : <ArrowRightIcon size={26} />}
          >
            {bottom.primary.label}
          </PrimaryButton>
        </div>
      </footer>
    </div>
  )
}
