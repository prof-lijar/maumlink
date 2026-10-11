import { Navigate, useNavigate, useParams } from 'react-router'
import { episodeTile, mapPlaces } from '@/design/devkitAssets'
import { episodesFor, getDomain } from '@/content/episodeIndex'
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
  if (!started || !avatarId || !domain) return <Navigate to="/" replace />
  const list = episodesFor(domain.id)

  return (
    <div className="garden-page" data-domain={domain.id}>
      <div className="garden-column garden-list">
        <header className="garden-list__header">
          <button
            type="button"
            className="garden-round-button"
            aria-label="지도로 돌아가기"
            onClick={() => navigate('/')}
          >
            ←
          </button>
          <span className="garden-list__brand">마음마을 탐험대</span>
        </header>
        <main className="garden-list__main">
          <section className="garden-hero">
            <div className="garden-hero__art">
              <img src={mapPlaces[domain.id].image} alt={domain.mapName} />
            </div>
            <div className="garden-hero__copy">
              <span className="garden-chip">{domain.name}</span>
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
                  <button
                    type="button"
                    className="garden-episode"
                    onClick={() => navigate(`/episode/${episode.id}/play`)}
                  >
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
    </div>
  )
}
