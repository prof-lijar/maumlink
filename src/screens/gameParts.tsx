import { useEffect, type ButtonHTMLAttributes, type ReactNode, type RefObject } from 'react'
import { useNavigate } from 'react-router'
import { KidSpeakerIcon } from '@/design/icons'
import { episodes } from '@/content/episodeIndex'
import { devkitArt } from '@/design/devkitAssets'
import { completionPercent, useMvpProgress } from '@/services/mvpProgress'
import { useSettings } from '@/services/settings'
import { speech } from '@/services/speech'
import { useAutoRead } from '@/services/useSpeak'
import gameCopy from '../../content/game-copy.json'

/** The completion line every story shares; read aloud together with the takeaway. */
export const COMPLETION_CHEER = gameCopy.completionCheer

/**
 * One tap mutes or unmutes narration for every screen (persisted in settings). Turning it on
 * also counts as the browser's audio activation, so the next phrase plays at once.
 */
export function VoiceButton({ className }: { className?: string }) {
  const enabled = useSettings((state) => state.voiceEnabled)
  const setVoiceEnabled = useSettings((state) => state.setVoiceEnabled)
  return (
    <button
      type="button"
      className={className ?? 'garden-round-button garden-voice-button'}
      aria-label={enabled ? '음성 끄기' : '음성 켜기'}
      aria-pressed={enabled}
      data-voice={enabled ? 'on' : 'off'}
      onClick={() => {
        const next = !useSettings.getState().voiceEnabled
        setVoiceEnabled(next)
        if (next) speech.unlock()
      }}
    >
      <KidSpeakerIcon muted={!enabled} />
    </button>
  )
}

/** Shared pieces of the life-garden activity screens (choice + sorting, and step episodes). */
export function SafetyPromise({ children }: { children: ReactNode }) {
  return (
    <div className="garden-safety">
      <span className="garden-safety__chip">안전 약속</span>
      <p>{children}</p>
    </div>
  )
}

export function Cta({ children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className="garden-cta" {...rest}>
      {children}
      <span aria-hidden="true">›</span>
    </button>
  )
}

/** The common completion screen (2026-10-10 개선 요청: 문구 + 버튼 세 개). */
export function EpisodeCompletion({
  takeaway,
  takeawayAudioUrl,
  loading = false,
  personal = false,
  listPath,
  progressSaved,
  onRestart,
  headingRef,
}: {
  /** The reviewed closing line, or the personal wrap-up when the child spoke. */
  takeaway: string
  /** Narration-voice audio of a personal wrap-up (played after the cheer). */
  takeawayAudioUrl?: string
  /** True while the personal wrap-up is being written. */
  loading?: boolean
  /** True when `takeaway` is the personal wrap-up rather than the reviewed line. */
  personal?: boolean
  listPath: string
  progressSaved: boolean
  onRestart: () => void
  headingRef: RefObject<HTMLHeadingElement | null>
}) {
  const navigate = useNavigate()
  const completed = useMvpProgress((progress) => progress.completedEpisodeIds)
  const percent = completionPercent(completed.length)
  const autoRead = useSettings((s) => s.autoRead)
  const locale = useSettings((s) => s.locale)
  // Fixed takeaway: cheer + takeaway through the usual recorded/synthesised path. Personal
  // wrap-up with audio: cheer first, then the generated clip. While loading, say nothing yet.
  useAutoRead(
    loading || takeawayAudioUrl ? undefined : `${COMPLETION_CHEER} ${takeaway}`,
    `complete:${takeaway}`,
  )
  useEffect(() => {
    if (!autoRead || !takeawayAudioUrl) return
    const cheer = { text: COMPLETION_CHEER, locale, automatic: true }
    const wrap = { text: takeaway, locale, audioUrl: takeawayAudioUrl, automatic: true }
    let cancelled = false
    void speech.speak(cheer).then(() => {
      if (!cancelled) void speech.speak(wrap)
    })
    return () => {
      cancelled = true
      speech.cancel(cheer)
      speech.cancel(wrap)
    }
  }, [autoRead, locale, takeaway, takeawayAudioUrl])
  return (
    <>
      <div className="garden-badge garden-badge--small">
        <img src={devkitArt.haruCelebrate} alt="기뻐하는 친구" />
      </div>
      <h1 ref={headingRef} tabIndex={-1} className="garden-complete-title">
        {COMPLETION_CHEER}
      </h1>
      <div className="garden-card garden-learned" aria-busy={loading}>
        <span className="garden-chip">{personal || loading ? '오늘 내가 한 말' : '마무리'}</span>
        {loading ? (
          <p className="garden-learned__loading" role="status">
            내가 한 말로 마무리 인사를 만들고 있어요…
          </p>
        ) : (
          <p>{takeaway}</p>
        )}
      </div>
      <div className="garden-progress">
        <div className="garden-progress__row">
          <span className="garden-progress__count">
            완료한 이야기 {completed.length} / {episodes.length}
          </span>
          <span className="garden-progress__percent">{percent}%</span>
        </div>
        <div
          className="garden-progress__track"
          role="progressbar"
          aria-label="전체 이야기 완료율"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <div className="garden-progress__fill" style={{ width: `${percent}%` }} />
        </div>
      </div>
      {!progressSaved && (
        <p role="status" className="garden-alert">
          완료 기록을 저장하지 못했어요. 저장 공간을 확인해 주세요.
        </p>
      )}
      <div className="garden-finish garden-finish--three">
        <button type="button" className="garden-finish__again" onClick={onRestart}>
          다시 연습하기
        </button>
        <button type="button" className="garden-finish__again" onClick={() => navigate(listPath)}>
          다른 이야기 만나기
        </button>
        <Cta onClick={() => navigate('/')}>탐험 지도로 돌아가기</Cta>
      </div>
    </>
  )
}
