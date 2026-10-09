import type { ReactNode } from 'react'
import type { Scenario } from '@/content/schema'
import { Illustration } from '@/design/Illustration'
import { GuideAvatar } from '@/design/Guide'
import { cn } from '@/design/cn'
import { keySentenceVisible, type LessonState } from '@/engine/lessonMachine'
import { useT } from '@/i18n/useT'
import { useAutoRead } from '@/services/useSpeak'

interface Props {
  scenario: Scenario
  state: LessonState
  onAdvance: () => void
}

function imageBase(scenario: Scenario, locale: 'ko' | 'en'): string | undefined {
  const img = scenario.situation.imageByLocale?.[locale] ?? scenario.situation.image
  return img ? img.replace(/\.(png|webp|jpe?g)$/i, '') : undefined
}

/** S1 — one sentence at a time, then the key sentence in a bubble (FR-S1-01/02/03). */
export function Situation({ scenario, state, onAdvance }: Props) {
  const { t, L, locale } = useT()
  const story = scenario.situation.story
  const keyVisible = keySentenceVisible(state, scenario)
  const current = keyVisible ? scenario.situation.keySentence : story[state.sentenceIndex]!
  const text = L(current)
  useAutoRead(text, `situation-${state.sentenceIndex}`, current.audio?.[locale])

  return (
    <div className="situation-layout" data-key-sentence={keyVisible}>
      <h1 className="story-heading">
        <span className="story-heading-pill">{L(scenario.situation.title)}</span>
      </h1>
      <div className="situation-art">
        <Illustration
          src={imageBase(scenario, locale)}
          alt={L(scenario.situation.imageBrief)}
          brief={L(scenario.situation.imageBrief)}
          domain={scenario.domain}
        >
          {scenario.situation.bubbles && (
            <ul className="scene-bubbles" aria-label={L(scenario.situation.imageBrief)}>
              {scenario.situation.bubbles.map((b, i) => (
                <li
                  key={i}
                  className="scene-bubble motion-safe:animate-[bubblePop_320ms_ease-out_both]"
                  style={{ left: `${b.x}%`, top: `${b.y}%`, animationDelay: `${200 + i * 350}ms` }}
                >
                  {L(b.text)}
                </li>
              ))}
            </ul>
          )}
        </Illustration>
      </div>
      <div className="situation-copy">
        <GuideAvatar pose={keyVisible ? 'point' : 'wave'} size="lg" className="story-guide" />
        <button
          type="button"
          data-testid="story-card"
          className="story-dialogue text-left"
          onClick={() => {
            if (!keyVisible) onAdvance()
          }}
          aria-live="polite"
        >
          <span
            key={state.sentenceIndex}
            className="story-sentence text-story font-bold text-ink motion-safe:animate-[fadeIn_240ms_ease-out]"
          >
            {emphasize(text, (scenario.situation.emphasis ?? []).map(L))}
          </span>
        </button>
        <div
          role="img"
          className="story-position flex items-center gap-2"
          aria-label={t('a11y.sentenceDots', {
            i: Math.min(state.sentenceIndex + 1, story.length + 1),
            n: story.length + 1,
          })}
        >
          {Array.from({ length: story.length + 1 }, (_, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={cn(
                'block size-3 rounded-full transition-colors',
                i <= state.sentenceIndex ? 'bg-go' : 'bg-line',
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/** Wrap each emphasised word (the source document prints them in colour) in a <strong>. */
function emphasize(text: string, words: string[]): ReactNode {
  const list = words.filter(Boolean)
  if (!list.length) return text
  const pattern = new RegExp(
    `(${list.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
  )
  return text.split(pattern).map((part, i) =>
    list.includes(part) ? (
      <strong key={i} className="story-emphasis">
        {part}
      </strong>
    ) : (
      part
    ),
  )
}
