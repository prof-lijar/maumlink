import { devkitArt } from '@/design/devkitAssets'
import { useSettings } from '@/services/settings'
import { sound } from '@/services/sound'
import { speech } from '@/services/speech'

/** One first-visit tap also unlocks browser audio. */
export function StartGate() {
  const setStarted = useSettings((state) => state.setStarted)
  return (
    <main className="explore-start">
      <div className="explore-start__sky" aria-hidden="true" />
      <h1>마음마을 탐험대</h1>
      <p>여러 상황에서 어떻게 행동하면 좋을지 함께 연습해요.</p>
      <div className="explore-start__characters" aria-hidden="true">
        <img src={devkitArt.haruFull} alt="" />
        <img src={devkitArt.dog} alt="" />
      </div>
      <button
        type="button"
        className="explore-primary"
        onClick={() => {
          speech.unlock()
          sound.unlock()
          setStarted()
        }}
      >
        시작하기 <span aria-hidden="true">›</span>
      </button>
    </main>
  )
}
