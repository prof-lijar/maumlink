import { Navigate, useNavigate, useParams } from 'react-router'
import { getDomain, getEpisode } from '@/content/episodeIndex'
import { devkitArt, placeArt } from '@/design/devkitAssets'
import { VoiceToggle } from '@/design/VoiceToggle'
import { useProfile } from '@/services/profile'
import { useSettings } from '@/services/settings'
import { useSpeak } from '@/services/useSpeak'

export function EpisodeIntro() {
  const { episodeId = '' } = useParams()
  const episode = getEpisode(episodeId)
  const domain = episode ? getDomain(episode.domainId) : undefined
  const started = useSettings((state) => state.started)
  const avatarId = useProfile((state) => state.avatarId)
  const { speak, supported } = useSpeak()
  const navigate = useNavigate()
  if (!started || !avatarId || !episode || !domain) return <Navigate to="/" replace />

  return (
    <div className="explore-intro-page" data-domain={domain.id}>
      <header className="explore-subheader">
        <button
          type="button"
          className="explore-icon-button"
          aria-label={`${domain.place} 목록으로 돌아가기`}
          onClick={() => navigate(`/area/${domain.id}`)}
        >
          ←
        </button>
        <span>에피소드 살펴보기</span>
        <VoiceToggle onEnable={() => void speak(episode.situation)} supported={supported} />
      </header>
      <main className="explore-intro-main">
        <div className="explore-scene-art" data-episode={episode.id} aria-hidden="true">
          {episode.id === 'B02' ? (
            <img className="explore-scene-art__story" src={devkitArt.b02Intro} alt="" />
          ) : (
            <>
              <img className="explore-scene-art__place" src={placeArt[domain.id]} alt="" />
              <img className="explore-scene-art__character" src={devkitArt.haruWave} alt="" />
            </>
          )}
        </div>
        <div className="explore-intro-card">
          <p className="explore-eyebrow">
            {domain.name} · {episode.id}
          </p>
          <h1>{episode.title}</h1>
          <p className="explore-intro-card__scene">{episode.situation}</p>
          <p className="explore-intro-card__goal">이번에는 어떤 행동을 하면 좋을지 생각해 봐요.</p>
        </div>
        <button
          type="button"
          className="explore-primary"
          onClick={() => navigate(`/episode/${episode.id}/play`)}
        >
          활동 시작하기
        </button>
      </main>
    </div>
  )
}
