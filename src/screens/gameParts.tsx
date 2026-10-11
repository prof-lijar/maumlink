import type { ButtonHTMLAttributes, ReactNode, RefObject } from 'react'
import { useNavigate } from 'react-router'
import { episodes } from '@/content/episodeIndex'
import { devkitArt } from '@/design/devkitAssets'
import { completionPercent, useMvpProgress } from '@/services/mvpProgress'

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
  listPath,
  progressSaved,
  onRestart,
  headingRef,
}: {
  takeaway: string
  listPath: string
  progressSaved: boolean
  onRestart: () => void
  headingRef: RefObject<HTMLHeadingElement | null>
}) {
  const navigate = useNavigate()
  const completed = useMvpProgress((progress) => progress.completedEpisodeIds)
  const percent = completionPercent(completed.length)
  return (
    <>
      <div className="garden-badge garden-badge--small">
        <img src={devkitArt.haruCelebrate} alt="기뻐하는 친구" />
      </div>
      <h1 ref={headingRef} tabIndex={-1} className="garden-complete-title">
        잘했어요! 오늘도 새로운 방법을 배웠어요.
      </h1>
      <div className="garden-card garden-learned">
        <span className="garden-chip">마무리</span>
        <p>{takeaway}</p>
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
