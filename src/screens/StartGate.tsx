import { BrandLogo } from '@/design/BrandLogo'
import { CharacterArt } from '@/design/CharacterArt'
import { GuideAvatar } from '@/design/Guide'
import { PrimaryButton } from '@/design/Button'
import { ArrowRightIcon } from '@/design/icons'
import { art } from '@/design/art'
import { useT } from '@/i18n/useT'
import { sound } from '@/services/sound'
import { speech } from '@/services/speech'

/** First-visit full-screen Start (FR-HOME-01): the one tap that unlocks audio everywhere. */
export function StartGate({ onStart }: { onStart: () => void }) {
  const { t } = useT()
  return (
    <main className="start-screen" style={{ ['--village' as string]: `url(${art.village(1600)})` }}>
      <div className="start-sky" aria-hidden="true" />
      <div className="start-copy">
        <h1 className="start-title">
          <BrandLogo className="start-wordmark" />
        </h1>
        <p className="start-description">{t('home.greeting')}</p>
      </div>
      <div className="start-art" aria-hidden="true">
        <CharacterArt avatar="haru" className="start-kid" animate />
        <GuideAvatar pose="wave" size="xl" className="start-guide" />
      </div>
      <PrimaryButton
        className="start-action"
        iconRight={<ArrowRightIcon />}
        onClick={() => {
          speech.unlock()
          sound.unlock()
          onStart()
        }}
      >
        {t('home.start')}
      </PrimaryButton>
    </main>
  )
}
