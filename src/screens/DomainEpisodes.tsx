import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { KidBackIcon } from '@/design/icons'
import { episodeTile, mapPlaces } from '@/design/devkitAssets'
import { episodesFor, getDomain, type Episode } from '@/content/episodeIndex'
import { getStepEpisode } from '@/content/episodes'
import { clearStepGame, stepGameStatus } from '@/engine/stepGame'
import { StoryDialog, type StoryDialogMode } from '@/screens/StoryDialog'
import { useMvpProgress } from '@/services/mvpProgress'
import { useProfile } from '@/services/profile'
import { useSettings } from '@/services/settings'

export function DomainEpisodes() {
  const { domainId = '' } = useParams()
  const domain = getDomain(domainId)
  const navigate = useNavigate()
  const started = useSettings((state) => state.started)
  const avatarId = useProfile((state) => state.avatarId)
  const completed = useMvpProgress((state) => state.completedEpisodeIds)
  const [asking, setAsking] = useState<{ episode: Episode; mode: StoryDialogMode } | null>(null)
  if (!started || !avatarId || !domain) return <Navigate to="/" replace />
  const list = episodesFor(domain.id)
  const play = (episode: Episode) => navigate(`/episode/${episode.id}/play`)
  // A half-done story asks 이어서/처음부터; a finished one asks 처음부터/아니요; a fresh one opens.
  const open = (episode: Episode) => {
    const story = getStepEpisode(episode.id)
    const status = story ? stepGameStatus(story) : 'fresh'
    if (status === 'in_progress') setAsking({ episode, mode: 'in_progress' })
    else if (status === 'finished' || completed.includes(episode.id))
      setAsking({ episode, mode: 'completed' })
    else play(episode)
  }

  return (
    <div className="garden-page" data-domain={domain.id}>
      <div className="garden-column garden-list">
        <header className="garden-list__header">
          <button
            type="button"
            className="garden-round-button garden-back-button"
            aria-label="지도로 돌아가기"
            onClick={() => navigate('/')}
          >
            <KidBackIcon />
          </button>
          <span className="garden-list__brand">마음마을 탐험대</span>
        </header>
        <main className="garden-list__main">
          <section className="garden-hero">
            <div className="garden-hero__art">
              <img src={mapPlaces[domain.id].image} alt={domain.mapName} />
            </div>
            <div className="garden-hero__copy">
              <span className="garden-chip">{domain.place}</span>
              <h1>{domain.mapName}</h1>
              <p>{domain.description}</p>
            </div>
          </section>
          <div className="garden-list__label">
            <h2>에피소드 {list.length}개</h2>
          </div>
          <ul className="garden-episodes">
            {list.map((episode, index) => {
              const tile = episodeTile(episode.id)
              const done = completed.includes(episode.id)
              return (
                <li key={episode.id}>
                  <button type="button" className="garden-episode" onClick={() => open(episode)}>
                    <span
                      className="garden-episode__tile"
                      style={{ background: tile.background, color: tile.color }}
                      aria-hidden="true"
                    >
                      {tile.image ? <img src={tile.image} alt="" /> : tile.glyph}
                    </span>
                    <span className="garden-episode__copy">
                      <span className="garden-episode__meta">
                        <span className="garden-episode__no">
                          이야기 {String(index + 1).padStart(2, '0')}
                        </span>
                        {done && <span className="garden-episode__done">✓ 완료</span>}
                        {episode.skillTag && (
                          <span className="garden-skill-tag">{episode.skillTag}</span>
                        )}
                      </span>
                      <span className="garden-episode__title">{episode.title}</span>
                      <span className="garden-episode__desc">{episode.summary}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </main>
      </div>
      {asking && (
        <StoryDialog
          mode={asking.mode}
          episodeId={asking.episode.id}
          storyTitle={asking.episode.title}
          onContinue={() => play(asking.episode)}
          onRestart={() => {
            clearStepGame(asking.episode.id)
            play(asking.episode)
          }}
          onClose={() => setAsking(null)}
        />
      )}
    </div>
  )
}
