import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { getEmotion, nextScenarioInDomain } from '@/content/loader'
import type { Scenario } from '@/content/schema'
import { IconButton, PrimaryButton, SecondaryButton } from '@/design/Button'
import { VoiceToggle } from '@/design/VoiceToggle'
import { BrandLogo } from '@/design/BrandLogo'
import { Card } from '@/design/Card'
import { CharacterArt } from '@/design/CharacterArt'
import { EmotionFace } from '@/design/EmotionTile'
import { GuideAvatar } from '@/design/Guide'
import { Ribbon } from '@/design/Ribbon'
import { ArrowRightIcon, HomeIcon, SettingsIcon, SparkleIcon } from '@/design/icons'
import { triedActions, chosenAction, type LessonState } from '@/engine/lessonMachine'
import { useT } from '@/i18n/useT'
import { useLesson } from '@/engine/store'
import { SettingsSheet } from '../SettingsSheet'
import { sound } from '@/services/sound'
import { useAutoRead, useSpeak } from '@/services/useSpeak'

interface Props {
  scenario: Scenario
  state: LessonState
  onExit: () => void
}

/** S6 — companion + guide celebrate, closing message as "오늘의 배움", concrete recap, next/home. */
export function Wrapup({ scenario, state, onExit }: Props) {
  const { t, L, locale } = useT()
  const navigate = useNavigate()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { speak } = useSpeak()
  const reset = useLesson((l) => l.reset)
  const closing = L(scenario.closing)
  useAutoRead(closing, `closing-${scenario.id}`, scenario.closing.audio?.[locale])

  useEffect(() => {
    sound.play('chime')
  }, [scenario.id])

  const action = chosenAction(state, scenario)
  // Explore mode recaps the coping ideas worth keeping that the child tried (a "reconsider"
  // option only if it was the final choice); otherwise the final choice.
  const actions = scenario.action.explore
    ? triedActions(state, scenario).filter((a) => a.quality !== 'reconsider' || a.id === action?.id)
    : action
      ? [action]
      : []
  const next = nextScenarioInDomain(scenario)
  const feelings = state.feelingIds.map(getEmotion)

  return (
    <div className="wrapup-screen" data-domain={scenario.domain}>
      <header className="wrapup-header">
        <div className="brand-lockup">
          <BrandLogo />
        </div>
        <div className="utility-controls">
          <VoiceToggle
            onEnable={() =>
              void speak(
                [
                  closing,
                  t('wrapup.path'),
                  ...feelings.map((f) => L(f.word)),
                  actions.length
                    ? `${t('feedback.myChoice')}. ${actions.map((a) => L(a.text)).join('. ')}`
                    : '',
                ]
                  .filter(Boolean)
                  .join(' '),
              )
            }
          />
          <IconButton label={t('nav.settings')} onClick={() => setSettingsOpen(true)}>
            <SettingsIcon />
          </IconButton>
        </div>
      </header>
      <main className="wrapup-main">
        <div className="wrapup-stage" aria-hidden="true">
          <span className="wrapup-sparkle wrapup-sparkle--1">
            <SparkleIcon size={28} />
          </span>
          <span className="wrapup-sparkle wrapup-sparkle--2">
            <SparkleIcon size={20} />
          </span>
          <CharacterArt className="wrapup-kid" animate />
          <GuideAvatar pose="cheer" size="xl" className="wrapup-guide" />
        </div>
        <h1 className="wrapup-title">
          <Ribbon>{t('wrapup.title')}</Ribbon>
        </h1>
        <Card
          tone="lesson"
          label={t('wrapup.lesson')}
          className="w-full"
          data-testid="closing-card"
          aria-live="polite"
        >
          <p className="text-story font-bold text-ink">{closing}</p>
        </Card>

        <section className="journey-recap" aria-label={t('wrapup.path')}>
          <h2 className="journey-heading">{t('wrapup.path')}</h2>
          <div className="journey-feelings">
            {feelings.map((f) => (
              <span key={f.id} className="journey-feeling">
                <EmotionFace emotion={f} className="journey-face" />
                <span>{L(f.word)}</span>
              </span>
            ))}
          </div>
          {actions.length > 0 && (
            <div className="journey-action" data-testid="journey-actions">
              <span className="text-caption font-bold text-ink-soft">{t('feedback.myChoice')}</span>
              {actions.length === 1 ? (
                <p className="journey-step">
                  <span className="journey-step-number" aria-hidden="true">
                    01
                  </span>
                  <span className="text-body font-bold">{L(actions[0]!.text)}</span>
                </p>
              ) : (
                <ul className="journey-action-list">
                  {actions.map((a, i) => (
                    <li key={a.id} className="journey-step">
                      <span className="journey-step-number" aria-hidden="true">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-body font-bold">{L(a.text)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>

        <div className="flex w-full flex-col gap-3 md:flex-row md:justify-center">
          <SecondaryButton
            icon={<HomeIcon size={26} />}
            onClick={onExit}
            data-testid="wrapup-home"
            full
            className="md:w-auto"
          >
            {t('nav.home')}
          </SecondaryButton>
          <PrimaryButton
            data-testid="wrapup-next"
            iconRight={<ArrowRightIcon size={26} />}
            full
            className="md:w-auto"
            onClick={() => {
              if (next) {
                reset()
                navigate(`/lesson/${next.id}`)
              } else onExit()
            }}
          >
            {t('nav.practiceAnother')}
          </PrimaryButton>
        </div>
      </main>
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
