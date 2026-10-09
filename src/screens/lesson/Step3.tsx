import { useState } from 'react'
import { getEmotion } from '@/content/loader'
import type { BodyPart, Scenario } from '@/content/schema'
import { BodyOutline } from '@/design/BodyOutline'
import { Card } from '@/design/Card'
import { ChoiceCard } from '@/design/ChoiceCard'
import { EmotionFace } from '@/design/EmotionTile'
import { GuideAvatar, GuideBubble } from '@/design/Guide'
import { ScenePeek } from '@/design/ScenePrompt'
import { cn } from '@/design/cn'
import { explorableFeelings, type LessonEvent, type LessonState } from '@/engine/lessonMachine'
import { CheckIcon } from '@/design/icons'
import { sound } from '@/services/sound'
import { useT } from '@/i18n/useT'
import { useAutoRead, useSpeak } from '@/services/useSpeak'

interface Props {
  scenario: Scenario
  state: LessonState
  dispatch: (e: LessonEvent) => void
  wiggle: number
}

/** S3 — reason / body-reaction / multiple-choice variants (FR-S3-01/02/03, FR-ENG-04). */
export function Step3({ scenario, state, dispatch, wiggle }: Props) {
  const { t, L, locale } = useT()
  const { speak } = useSpeak()
  const step3 = scenario.step3
  const feelings = state.feelingIds.map(getEmotion)
  const first = feelings[0]
  const exploring = step3.type === 'body-reaction' && step3.explore === true
  const comparing = step3.type === 'reason' && step3.explore === true
  // 관계 관리: the principle is the key feedback, revealed once a reason has been chosen.
  const principleAsFeedback =
    step3.type === 'multiple-choice' && step3.principleAfterChoice === true
  const principleShown = !principleAsFeedback || state.step3OptionId !== undefined
  const explored = state.exploredFeelingId ? getEmotion(state.exploredFeelingId) : undefined

  // Auto-read: the header + question + (for per-feeling variants) the first explanation.
  const intro = [
    first ? t('feeling.chose', { emotion: L(first.word) }) : '',
    L(step3.question),
    step3.type === 'reason' && first ? L(step3.byFeeling[first.id] ?? { ko: '' }) : '',
    step3.type === 'body-reaction' && !exploring && first
      ? L(step3.byFeeling[first.id]?.text ?? { ko: '' })
      : '',
    step3.type === 'body-reaction' && exploring && explored
      ? L(step3.byFeeling[explored.id]?.text ?? { ko: '' })
      : '',
    exploring && !explored ? t('step3.explore') : '',
  ]
    .concat(
      step3.principle && !principleAsFeedback && step3.narratePrinciple !== false
        ? L(step3.principle)
        : '',
    )
    .filter(Boolean)
    .join(' ')
  // In explore mode only the opening is read automatically (frozen at mount); each press speaks
  // its own reaction instead of re-reading the whole screen over it.
  const [openingIntro] = useState(intro)
  useAutoRead(exploring || comparing ? openingIntro : intro, `step3-${state.feelingIds.join(',')}`)
  useAutoRead(
    state.moreShown && step3.more ? L(step3.more) : undefined,
    `more-${state.moreShown}`,
    step3.more?.audio?.[locale],
  )

  return (
    <div className="lesson-question-screen flex flex-col gap-4">
      <div className="question-row">
        <ScenePeek scenario={scenario} />
        <GuideBubble pose="think" aria-live="polite">
          {L(step3.question)}
        </GuideBubble>
      </div>
      {first && (
        <div className="chosen-feeling" aria-live="polite">
          <EmotionFace emotion={first} className="chosen-feeling-face" />
          <span className="text-body font-bold text-ink">
            {t('feeling.chose', { emotion: feelings.map((f) => L(f.word)).join(', ') })}
          </span>
        </div>
      )}

      {step3.type === 'reason' && comparing && (
        <div className="reason-compare">
          {first && step3.byFeeling[first.id] && (
            <Card tone="domain" domain={scenario.domain} data-testid="own-reason">
              <p className="text-story font-bold text-ink">{L(step3.byFeeling[first.id]!)}</p>
            </Card>
          )}
          <section
            className="reason-compare-others"
            {...(step3.compareHeading
              ? { 'aria-labelledby': 'reason-compare-title' }
              : { 'aria-label': L(step3.question) })}
          >
            {/* Document text only, e.g. 관계 인식's title “나와 너의 생각이 다를 수 있어!”. */}
            {step3.compareHeading && (
              <h2 id="reason-compare-title" className="reason-compare-title">
                {L(step3.compareHeading)}
              </h2>
            )}
            <ul className="reason-compare-list" data-testid="reason-compare">
              {explorableFeelings(scenario)
                .filter((id) => id !== first?.id)
                .map((id) => {
                  const e = getEmotion(id)
                  const open = state.exploredFeelingIds.includes(id)
                  const reason = step3.byFeeling[id]!
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        aria-expanded={open}
                        data-emotion={id}
                        className="reason-compare-item tap"
                        style={{ ['--tile-tint' as string]: e.tint }}
                        onClick={() => {
                          sound.play('tick')
                          void speak(`${L(e.word)}. ${L(reason)}`)
                          dispatch({ type: 'EXPLORE_FEELING', id })
                        }}
                      >
                        <EmotionFace emotion={e} className="body-explorer-face" />
                        <span className="reason-compare-text">
                          <span className="reason-compare-word">{L(e.word)}</span>
                          {open && (
                            <span className="reason-compare-reason motion-safe:animate-[fadeIn_240ms_ease-out]">
                              {L(reason)}
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  )
                })}
            </ul>
          </section>
        </div>
      )}

      {step3.type === 'reason' && !comparing && (
        <div className="flex flex-col gap-3">
          {feelings.map((f) => {
            const text = step3.byFeeling[f.id]
            if (!text) return null
            return (
              <Card key={f.id} tone="domain" domain={scenario.domain}>
                <p className="text-story font-bold text-ink">{L(text)}</p>
              </Card>
            )
          })}
        </div>
      )}

      {step3.type === 'body-reaction' && exploring && (
        <div className="body-explorer">
          <div
            role="group"
            aria-label={t('step3.explore')}
            className="body-explorer-feelings"
            data-testid="body-explorer"
          >
            {explorableFeelings(scenario).map((id) => {
              const e = getEmotion(id)
              const active = state.exploredFeelingId === id
              const seen = state.exploredFeelingIds.includes(id)
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={active}
                  data-emotion={id}
                  className="body-explorer-feeling tap"
                  style={{ ['--tile-tint' as string]: e.tint }}
                  onClick={() => {
                    sound.play('tick')
                    const text = step3.byFeeling[id]?.text
                    void speak(`${L(e.word)}. ${text ? L(text) : ''}`)
                    dispatch({ type: 'EXPLORE_FEELING', id })
                  }}
                >
                  <EmotionFace emotion={e} className="body-explorer-face" />
                  <span>{L(e.word)}</span>
                  {seen && !active && (
                    <span className="body-explorer-seen" aria-hidden="true">
                      <CheckIcon size={14} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          <div className="body-reaction-layout">
            <div className="body-reaction-art" data-feeling={explored?.id ?? ''}>
              <BodyOutline
                key={explored?.id ?? 'none'}
                parts={explored ? (step3.byFeeling[explored.id]?.parts ?? []) : []}
                animate
              />
            </div>
            <Card
              key={explored?.id ?? 'none'}
              tone={explored ? 'domain' : undefined}
              domain={scenario.domain}
              label={explored ? L(explored.word) : undefined}
              className="motion-safe:animate-[fadeIn_240ms_ease-out]"
              data-testid="body-reaction-card"
              aria-live="polite"
            >
              <p className="text-story font-bold text-ink">
                {explored
                  ? L(step3.byFeeling[explored.id]?.text ?? { ko: '' })
                  : t('step3.explore')}
              </p>
            </Card>
          </div>
        </div>
      )}

      {step3.type === 'body-reaction' && !exploring && (
        <div className="body-reaction-layout">
          <div className="body-reaction-art">
            <BodyOutline
              parts={unionParts(feelings.map((f) => step3.byFeeling[f.id]?.parts ?? []))}
            />
          </div>
          <div className="flex flex-col gap-3">
            {feelings.map((f) => {
              const entry = step3.byFeeling[f.id]
              if (!entry) return null
              return (
                <Card key={f.id} tone="domain" domain={scenario.domain}>
                  <p className="text-story font-bold text-ink">{L(entry.text)}</p>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {step3.type === 'multiple-choice' && (
        <div className="flex flex-col gap-3">
          <div
            key={wiggle}
            role="radiogroup"
            aria-label={L(step3.question)}
            className={cn(
              'grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4',
              wiggle > 0 && 'motion-safe:animate-[wiggle_300ms_ease-in-out_1]',
            )}
          >
            {step3.options.map((o) => {
              const selected = state.step3OptionId === o.id
              return (
                <ChoiceCard
                  key={o.id}
                  id={o.id}
                  domain={scenario.domain}
                  text={L(o.text)}
                  selected={selected}
                  onSelect={(id) => {
                    void speak(
                      [
                        L(o.text),
                        o.ack && L(o.ack),
                        principleAsFeedback && step3.principle && L(step3.principle),
                      ]
                        .filter(Boolean)
                        .join(' '),
                    )
                    dispatch({ type: 'SELECT_STEP3_OPTION', id })
                  }}
                  onSpeak={() => void speak(`${L(o.text)}${o.ack ? ` ${L(o.ack)}` : ''}`)}
                >
                  {selected && o.ack ? L(o.ack) : undefined}
                </ChoiceCard>
              )
            })}
          </div>
        </div>
      )}

      {step3.principle && principleAsFeedback && principleShown && (
        <div className="feedback-dialogue motion-safe:animate-[fadeIn_240ms_ease-out]">
          <GuideAvatar pose="point" size="xl" className="feedback-guide" />
          <Card aria-live="polite" data-testid="step3-key-feedback" className="feedback-card">
            <p className="text-story font-bold text-ink">{L(step3.principle)}</p>
          </Card>
        </div>
      )}
      {step3.principle && !principleAsFeedback && (
        <Card tone="lesson" label={t('wrapup.lesson')}>
          <p className="text-body font-bold text-ink">{L(step3.principle)}</p>
        </Card>
      )}

      {state.moreShown && step3.more && (
        <Card className="motion-safe:animate-[fadeIn_240ms_ease-out]" data-testid="step3-more">
          <p className="text-body text-ink">{L(step3.more)}</p>
        </Card>
      )}
    </div>
  )
}

function unionParts(lists: BodyPart[][]): BodyPart[] {
  return [...new Set(lists.flat())]
}
