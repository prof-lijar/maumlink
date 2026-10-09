import { getEmotion } from '@/content/loader'
import type { Scenario } from '@/content/schema'
import { EmotionTile } from '@/design/EmotionTile'
import { GuideBubble } from '@/design/Guide'
import { ScenePeek } from '@/design/ScenePrompt'
import { Sheet } from '@/design/Sheet'
import { cn } from '@/design/cn'
import type { LessonEvent, LessonState } from '@/engine/lessonMachine'
import { useT } from '@/i18n/useT'
import { useIdle } from '@/services/idle'
import { sound } from '@/services/sound'
import { useAutoRead, useSpeak } from '@/services/useSpeak'

const IDLE_MS = 20_000

interface Props {
  scenario: Scenario
  state: LessonState
  dispatch: (e: LessonEvent) => void
  wiggle: number
}

/** S2 — emotion grid, help button, hint sheet, idle auto-hint, not-sure flow (FR-S2-*). */
export function Feeling({ scenario, state, dispatch, wiggle }: Props) {
  const { t, L, locale } = useT()
  const { speak } = useSpeak()
  const q = scenario.feeling.question
  useAutoRead(L(q), 'feeling', q.audio?.[locale])

  useIdle(
    IDLE_MS,
    () => dispatch({ type: 'IDLE_TICK' }),
    !state.hintOpen && !state.hintAutoShown && state.feelingIds.length === 0,
  )

  const options = scenario.feeling.options.map(getEmotion)
  const cols = options.length >= 7 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
  const tint = `var(--color-domain-${scenario.domain})`

  return (
    <div className="lesson-question-screen flex flex-col gap-4">
      <div className="question-row">
        <ScenePeek scenario={scenario} />
        <GuideBubble pose="point" aria-live="polite">
          {L(q)}
        </GuideBubble>
      </div>
      <div
        key={wiggle}
        role="group"
        aria-label={L(q)}
        className={cn(
          'feeling-grid grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4',
          cols,
          wiggle > 0 && 'motion-safe:animate-[wiggle_300ms_ease-in-out_1]',
        )}
      >
        {options.map((e) => (
          <EmotionTile
            key={e.id}
            emotion={e}
            selected={state.feelingIds.includes(e.id)}
            onSelect={(id) => {
              void speak(e.word)
              dispatch({ type: 'SELECT_FEELING', id })
            }}
          />
        ))}
      </div>

      <Sheet
        open={state.hintOpen}
        onClose={() => dispatch({ type: 'CLOSE_HINT' })}
        title={t('hint.title')}
        tint={tint}
      >
        <HintBody
          scenario={scenario}
          onPick={(id) => dispatch({ type: 'SELECT_HINT_FEELING', id })}
        />
      </Sheet>
    </div>
  )
}

function HintBody({ scenario, onPick }: { scenario: Scenario; onPick: (id: string) => void }) {
  const { t, L, locale } = useT()
  const { speak } = useSpeak()
  const hint = scenario.feeling.hint
  useAutoRead(L(hint.text), `hint-${scenario.id}`, hint.text.audio?.[locale])
  const suggestions = hint.suggest.map(getEmotion)
  return (
    <div className="flex flex-col gap-4">
      <GuideBubble as="p" pose="think">
        {L(hint.text)}
      </GuideBubble>
      <p className="text-caption font-bold text-ink">{t('hint.maybe')}</p>
      <div className="grid grid-cols-2 gap-4">
        {suggestions.map((e) => (
          <EmotionTile
            key={e.id}
            emotion={e}
            selected={false}
            size="compact"
            onSelect={(id) => {
              sound.play('chime')
              void speak(e.word)
              onPick(id)
            }}
          />
        ))}
      </div>
    </div>
  )
}

export { IDLE_MS }
