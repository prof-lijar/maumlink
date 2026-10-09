import { useT } from '@/i18n/useT'
import { CheckIcon } from './icons'
import { cn } from './cn'

const STEPS = 5

/**
 * Five dots on a mint rail that fills as the child progresses (PRD §6.1/§6.7).
 * The current dot is larger; finished dots carry a check.
 */
export function ProgressLink({ index }: { index: number }) {
  const { t } = useT()
  const done = Math.min(index, STEPS)
  const pct = (Math.min(index, STEPS - 1) / (STEPS - 1)) * 100
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={STEPS}
      aria-valuenow={Math.min(index + 1, STEPS)}
      aria-label={t('progress.label', { i: Math.min(index + 1, STEPS), n: STEPS })}
    >
      <span className="progress-rail" aria-hidden="true" />
      <span
        className="progress-fill"
        style={{ width: `calc((100% - 12px) * ${pct / 100})` }}
        aria-hidden="true"
      />
      {Array.from({ length: STEPS }, (_, i) => {
        const isDone = i < done
        const isCurrent = i === index
        return (
          <span
            key={i}
            aria-hidden="true"
            className={cn(
              'progress-node',
              isCurrent ? 'progress-node--current' : isDone && 'progress-node--done',
            )}
          >
            {isDone ? <CheckIcon size={14} /> : null}
          </span>
        )
      })}
    </div>
  )
}
