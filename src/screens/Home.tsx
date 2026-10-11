import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router'
import { domains, episodes, episodesFor } from '@/content/episodeIndex'
import { avatarArt, devkitArt, mapBackground, mapPlaces } from '@/design/devkitAssets'
import { StartGate } from './StartGate'
import { AvatarSelect } from './AvatarSelect'
import { useMvpProgress, completionPercent } from '@/services/mvpProgress'
import { useProfile } from '@/services/profile'
import { useSettings } from '@/services/settings'

const greeting = '안녕! 오늘은 어느 곳을 탐험할까요?'

export function Home() {
  const started = useSettings((state) => state.started)
  const avatarId = useProfile((state) => state.avatarId)
  if (!started) return <StartGate />
  if (!avatarId) return <AvatarSelect />
  return <ExploreMap />
}

function ExploreMap() {
  const navigate = useNavigate()
  const avatarId = useProfile((state) => state.avatarId)
  const completed = useMvpProgress((state) => state.completedEpisodeIds)
  const count = completed.length
  const total = episodes.length
  const percent = completionPercent(count)

  return (
    <div className="explore-map-page">
      <main className="explore-map-main">
        <div className="explore-greeting">
          <span className="explore-greeting__avatar">
            <img src={avatarId ? avatarArt[avatarId] : devkitArt.haruAvatar} alt="" />
          </span>
          <h1>{greeting}</h1>
        </div>
        <div
          className="explore-card explore-progress"
          role="status"
          aria-label={`완료한 에피소드 ${count}개, 전체 ${total}개 중 ${percent}퍼센트`}
        >
          <div>
            <strong>
              {count} / {total}
            </strong>
            <span>완료한 에피소드</span>
          </div>
          <div className="explore-progress__track" aria-hidden="true">
            <span style={{ width: `${percent}%` }} />
          </div>
          <strong className="explore-progress__pct">{percent}%</strong>
        </div>

        <section
          className="explore-map"
          aria-label="마음마을 지도"
          style={{ '--map-bg': `url(${mapBackground})` } as CSSProperties}
        >
          {domains.map((domain) => {
            const art = mapPlaces[domain.id]
            const marks = episodesFor(domain.id).map((episode) => completed.includes(episode.id))
            const done = marks.filter(Boolean).length
            return (
              <button
                key={domain.id}
                type="button"
                className="explore-place"
                data-place={domain.id}
                data-wide={art.wide || undefined}
                onClick={() => navigate(`/area/${domain.id}`)}
                aria-label={`${domain.mapName}, ${domain.name}, ${marks.length}개 중 ${done}개 완료`}
              >
                <span className="explore-place__name">{domain.mapName}</span>
                <img
                  className="explore-place__art"
                  src={art.image}
                  alt=""
                  style={{ height: art.height }}
                />
                <span className="explore-place__tag">
                  <span className="explore-place__category">{domain.name}</span>
                  <span className="explore-place__status">
                    <span className="explore-place__dots">
                      {marks.map((on, i) => (
                        <span key={i} data-on={on || undefined} />
                      ))}
                    </span>
                    <span className="explore-place__count">
                      {done}/{marks.length}
                    </span>
                  </span>
                </span>
              </button>
            )
          })}
        </section>
      </main>
    </div>
  )
}
