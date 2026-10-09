import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { scenariosByDomain } from '@/content/loader'
import type { Domain, Scenario } from '@/content/schema'
import { VoiceToggle } from '@/design/VoiceToggle'
import { BrandLogo } from '@/design/BrandLogo'
import { CharacterArt } from '@/design/CharacterArt'
import { GuideBubble } from '@/design/Guide'
import { IconButton } from '@/design/Button'
import { Sheet } from '@/design/Sheet'
import { art, sprite } from '@/design/art'
import { cn } from '@/design/cn'
import { CheckIcon, ChevronRightIcon, SettingsIcon, StarIcon } from '@/design/icons'
import { useT } from '@/i18n/useT'
import { useLesson } from '@/engine/store'
import { useProgress } from '@/services/progress'
import { useSettings } from '@/services/settings'
import { sound } from '@/services/sound'
import { useAutoRead, useSpeak } from '@/services/useSpeak'
import { CharacterPick } from './CharacterPick'
import { SettingsSheet } from './SettingsSheet'
import { StartGate } from './StartGate'

const ORDER: Domain[] = ['self', 'social', 'relation', 'mind']

export function Home() {
  const started = useSettings((s) => s.started)
  const setStarted = useSettings((s) => s.setStarted)
  const [picking, setPicking] = useState(false)
  if (!started && picking) return <CharacterPick onDone={setStarted} />
  if (!started) return <StartGate onStart={() => setPicking(true)} />
  return <HomeInner />
}

function HomeInner() {
  const { t, L, locale } = useT()
  const navigate = useNavigate()
  const { speak, supported } = useSpeak()
  const entries = useProgress((s) => s.entries)
  const soundOn = useSettings((s) => s.sound)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [picker, setPicker] = useState<Domain | null>(null)
  const greeting = t('home.greeting')

  useEffect(() => sound.setEnabled(soundOn), [soundOn])
  useAutoRead(greeting, 'home')

  const reset = useLesson((l) => l.reset)
  const open = (s: Scenario) => {
    reset()
    navigate(`/lesson/${s.id}`)
  }
  const stars = ORDER.flatMap((d) => scenariosByDomain[d]).filter((s) => entries[s.id]).length

  return (
    <div className="village" style={{ ['--village' as string]: `url(${art.village(1600)})` }}>
      <header className="village-top">
        <div className="village-header">
          <div className="brand-lockup">
            <BrandLogo />
          </div>
          <div className="utility-controls">
            <span className="star-badge" aria-label={`${t('home.stars')} ${stars}`}>
              <StarIcon size={22} />
              <span>{stars}</span>
            </span>
            <VoiceToggle onEnable={() => void speak(greeting)} supported={supported} />
            <IconButton label={t('nav.settings')} onClick={() => setSettingsOpen(true)}>
              <SettingsIcon />
            </IconButton>
          </div>
        </div>
        <div className="village-greeting">
          <CharacterArt variant="bust" className="village-me" />
          <GuideBubble pose="wave" className="village-bubble">
            {greeting}
          </GuideBubble>
        </div>
      </header>

      <main className="village-map">
        {!supported && (
          <p className="mb-2 text-center text-caption text-ink-soft">{t('tts.unavailable')}</p>
        )}
        <section aria-label={t('home.pick')} className="village-places">
          {ORDER.map((d) => {
            const list = scenariosByDomain[d]
            const reserved = list.length === 0
            const done = list.length > 0 && list.every((s) => entries[s.id])
            const scene = list[0]
            return (
              <button
                key={d}
                type="button"
                data-domain={d}
                disabled={reserved}
                aria-label={`${scene ? `${L(scene.situation.title)} · ` : ''}${t(`place.${d}`)} · ${t(`domain.${d}`)}${reserved ? ` (${t('home.reserved')})` : ''}${done ? ` · ${t('home.done')}` : ''}`}
                className={cn('domain-card place-card', reserved && 'place-card--reserved')}
                onClick={() => {
                  if (reserved) return
                  sound.play('tick')
                  if (list.length === 1) open(list[0]!)
                  else setPicker(d)
                }}
              >
                <span className="place-art" aria-hidden="true">
                  <img
                    {...sprite(art.place(d, 400), art.place(d, 800))}
                    alt=""
                    width={400}
                    height={400}
                    decoding="async"
                  />
                  {done && (
                    <span className="place-done domain-completed">
                      <CheckIcon size={16} /> {t('home.done')}
                    </span>
                  )}
                </span>
                <span className="place-label">
                  <span className="place-name">{t(`place.${d}`)}</span>
                  <span className="place-domain">{t(`domain.${d}`)}</span>
                  {scene && !reserved && (
                    <span className="place-scene">{L(scene.situation.title)}</span>
                  )}
                </span>
                {!reserved && (
                  <span className="place-go" aria-hidden="true">
                    <ChevronRightIcon size={24} />
                  </span>
                )}
              </button>
            )
          })}
        </section>
        {locale === 'en' && <p className="sr-only">{t('app.tagline')}</p>}
      </main>
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <Sheet open={picker !== null} onClose={() => setPicker(null)} title={t('home.pick')}>
        <div className="flex flex-col gap-3">
          {(picker ? scenariosByDomain[picker] : []).map((s) => (
            <button
              key={s.id}
              type="button"
              data-domain-tone={s.domain}
              className="episode-row tap"
              onClick={() => open(s)}
            >
              <span className="episode-title">{L(s.situation.title)}</span>
              <span className="episode-stars" aria-hidden="true">
                <StarIcon size={20} className={entries[s.id] ? 'episode-star--on' : undefined} />
              </span>
              {entries[s.id] && <CheckIcon size={22} />}
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  )
}
