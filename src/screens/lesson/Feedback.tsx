import type { Scenario } from '@/content/schema'
import { Card } from '@/design/Card'
import { GuideAvatar } from '@/design/Guide'
import { Ribbon } from '@/design/Ribbon'
import { chosenAction, type LessonState } from '@/engine/lessonMachine'
import { useT } from '@/i18n/useT'
import { useAutoRead } from '@/services/useSpeak'

interface Props {
  scenario: Scenario
  state: LessonState
}

/**
 * S5 — outcome panel (the flowchart's "view result", D7) + explanatory feedback (FR-S5-01).
 * A recommended idea gets a cheer; any other idea gets the same warm "shall we think again?"
 * so no choice is ever marked wrong (acceptance §14.3).
 */
export function Feedback({ scenario, state }: Props) {
  const { t, L, locale } = useT()
  const action = chosenAction(state, scenario)
  const text = action ? L(action.feedback) : ''
  useAutoRead(text, `feedback-${action?.id ?? ''}`, action?.feedback.audio?.[locale])
  if (!action) return null
  const cheer = action.quality === 'recommended'
  return (
    <div className="feedback-layout">
      <h1 className="sr-only">
        {scenario.stepTitles?.feedback ? L(scenario.stepTitles.feedback) : t('step.feedback')}
      </h1>
      <Ribbon tone={cheer ? 'sun' : 'pink'} data-testid="feedback-ribbon">
        {cheer ? t('feedback.great') : t('feedback.rethink')}
      </Ribbon>
      <Card
        label={t('feedback.myChoice')}
        tone="domain"
        domain={scenario.domain}
        className="outcome-panel"
        data-testid="outcome-panel"
      >
        <div className="outcome-row">
          <span className="outcome-badge">
            <img src={`/icons/outcome/${action.outcomeIcon}.svg`} alt="" width={36} height={36} />
          </span>
          <p className="outcome-text text-body font-bold text-ink">{L(action.text)}</p>
        </div>
      </Card>
      <div className="feedback-dialogue">
        <GuideAvatar pose={cheer ? 'cheer' : 'think'} size="xl" className="feedback-guide" />
        <Card data-testid="feedback-card" aria-live="polite" className="feedback-card">
          <p className="text-story font-bold text-ink">{text}</p>
        </Card>
      </div>
    </div>
  )
}
