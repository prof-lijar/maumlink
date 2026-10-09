import type { Scenario } from '@/content/schema'
import { ChoiceCard } from '@/design/ChoiceCard'
import { GuideBubble } from '@/design/Guide'
import { ScenePeek } from '@/design/ScenePrompt'
import { cn } from '@/design/cn'
import type { LessonEvent, LessonState } from '@/engine/lessonMachine'
import { useT } from '@/i18n/useT'
import { useAutoRead, useSpeak } from '@/services/useSpeak'

interface Props {
  scenario: Scenario
  state: LessonState
  dispatch: (e: LessonEvent) => void
  wiggle: number
}

/** S4 — four coping actions (FR-S4-01); previously tried ones are dimmed (FR-S5-02). */
export function Action({ scenario, state, dispatch, wiggle }: Props) {
  const { L, locale } = useT()
  const { speak } = useSpeak()
  const q = scenario.action.question
  useAutoRead(L(q), 'action', q.audio?.[locale])
  return (
    <div className="lesson-question-screen flex flex-col gap-4">
      <div className="question-row">
        <ScenePeek scenario={scenario} />
        <GuideBubble pose="think" aria-live="polite">
          {L(q)}
        </GuideBubble>
      </div>
      <div
        key={wiggle}
        role="radiogroup"
        aria-label={L(q)}
        className={cn(
          'grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4',
          wiggle > 0 && 'motion-safe:animate-[wiggle_300ms_ease-in-out_1]',
        )}
      >
        {scenario.action.options.map((o) => (
          <ChoiceCard
            key={o.id}
            id={o.id}
            domain={scenario.domain}
            text={L(o.text)}
            icon={o.outcomeIcon}
            selected={state.actionId === o.id}
            dimmed={state.triedActionIds.includes(o.id)}
            onSelect={(id) => {
              void speak(o.text)
              dispatch({ type: 'SELECT_ACTION', id })
            }}
            onSpeak={() => void speak(o.text)}
          />
        ))}
      </div>
    </div>
  )
}
