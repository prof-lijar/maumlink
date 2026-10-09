import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router'
import { getEmotion, getScenario } from '@/content/loader'
import { PrimaryButton, SecondaryButton } from '@/design/Button'
import { Sheet } from '@/design/Sheet'
import { HelpIcon, ReplayIcon } from '@/design/icons'
import {
  canProceed,
  canTryAnother,
  progressIndex,
  type LessonEvent,
  type Step,
} from '@/engine/lessonMachine'
import { useLesson } from '@/engine/store'
import { useT } from '@/i18n/useT'
import { useSettings } from '@/services/settings'
import { sound } from '@/services/sound'
import { speech } from '@/services/speech'
import { useSpeak } from '@/services/useSpeak'
import { SettingsSheet } from '../SettingsSheet'
import { Action } from './Action'
import { Feedback } from './Feedback'
import { Feeling } from './Feeling'
import { LessonShell, type BottomBar } from './LessonShell'
import { Situation } from './Situation'
import { Step3 } from './Step3'
import { Wrapup } from './Wrapup'

/** Lesson orchestrator — binds the engine store to the six screens and the shell (FR-ENG-03). */
export function Lesson() {
  const { scenarioId = '' } = useParams()
  const scenario = getScenario(scenarioId)
  const navigate = useNavigate()
  const location = useLocation()
  const { t, L } = useT()
  const { speak, supported } = useSpeak()
  const started = useSettings((s) => s.started)
  const soundOn = useSettings((s) => s.sound)
  const { state, start, dispatch, end } = useLesson()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [confirmHome, setConfirmHome] = useState(false)
  const [wiggle, setWiggle] = useState(0)

  useEffect(() => sound.setEnabled(soundOn), [soundOn])

  useEffect(() => {
    if (scenario) start(scenario)
  }, [scenario, start])

  // Layout effects run before children's auto-read effects, so only the old screen is cancelled.
  useLayoutEffect(() => {
    speech.cancel()
  }, [state?.step])
  useEffect(() => () => speech.cancel(), [])

  const currentStep = state?.step
  const currentScenarioId = state?.scenarioId

  // The store owns progress. URL changes describe it; a deep link cannot skip a lesson.
  useEffect(() => {
    if (!currentStep || currentScenarioId !== scenarioId) return
    const path = `/lesson/${scenarioId}${currentStep === 'wrapup' ? '/done' : ''}`
    const params = new URLSearchParams(location.search)
    params.set('step', currentStep)
    const next = `${path}?${params}`
    if (`${location.pathname}${location.search}` !== next) navigate(next, { replace: true })
  }, [currentStep, currentScenarioId, scenarioId, location.pathname, location.search, navigate])

  // One-shot announcements from the reducer (pickFirst / notSureTwice).
  const announce = state?.announce
  useEffect(() => {
    if (!announce) return
    if (announce.kind === 'pickFirst') {
      void speak(t('feeling.pickFirst'))
    } else {
      void speak(t('feeling.notSureTwice', { emotion: L(getEmotion(announce.emotionId).word) }))
    }
    dispatch({ type: 'CLEAR_ANNOUNCE' })
  }, [announce, dispatch, speak, t, L])

  const exit = useCallback(() => {
    speech.cancel()
    end()
    navigate('/', { replace: true })
  }, [end, navigate])

  if (!scenario) return <Navigate to="/" replace />
  if (!started) return <Navigate to="/" replace />
  if (!state || state.scenarioId !== scenario.id) return null

  const d = (e: LessonEvent) => {
    dispatch(e)
    if (useLesson.getState().state?.announce?.kind === 'pickFirst') setWiggle((w) => w + 1)
  }

  if (state.step === 'wrapup') return <Wrapup scenario={scenario} state={state} onExit={exit} />

  // Build what the shell needs for this step.
  let bottom: BottomBar
  let body: React.ReactNode
  const backTo = (label = t('nav.back')) => ({ label, onClick: () => d({ type: 'BACK' }) })

  switch (state.step) {
    case 'situation':
      body = (
        <Situation
          scenario={scenario}
          state={state}
          onAdvance={() => {
            sound.play('turn')
            d({ type: 'NEXT' })
          }}
        />
      )
      bottom = {
        back: state.sentenceIndex > 0 ? backTo() : undefined,
        primary: {
          label: t('nav.next'),
          onClick: () => {
            sound.play('turn')
            d({ type: 'NEXT' })
          },
        },
      }
      break
    case 'feeling':
      body = <Feeling scenario={scenario} state={state} dispatch={d} wiggle={wiggle} />
      bottom = {
        back: backTo(),
        primary: {
          label: t('nav.next'),
          onClick: () => d({ type: 'NEXT' }),
          softDisabled: !canProceed(state, scenario),
        },
        extra: (
          <SecondaryButton
            icon={<HelpIcon size={26} />}
            onClick={() => d({ type: 'OPEN_HINT' })}
            data-testid="nav-help"
          >
            {t('nav.help')}
          </SecondaryButton>
        ),
      }
      break
    case 'step3':
      body = <Step3 scenario={scenario} state={state} dispatch={d} wiggle={wiggle} />
      bottom = {
        back: backTo(),
        primary: {
          label: t('nav.gotIt'),
          onClick: () => d({ type: 'GOT_IT' }),
          softDisabled: !canProceed(state, scenario),
        },
        extra:
          scenario.step3.more && !state.moreShown ? (
            <SecondaryButton onClick={() => d({ type: 'TELL_MORE' })} data-testid="nav-more">
              {t('nav.tellMore')}
            </SecondaryButton>
          ) : undefined,
      }
      break
    case 'action':
      body = <Action scenario={scenario} state={state} dispatch={d} wiggle={wiggle} />
      bottom = {
        back: backTo(),
        primary: {
          label: t('nav.chooseThis'),
          onClick: () => d({ type: 'CHOOSE' }),
          softDisabled: !canProceed(state, scenario),
        },
      }
      break
    case 'feedback':
      body = <Feedback scenario={scenario} state={state} />
      bottom = {
        back: backTo(),
        primary: { label: t('nav.continue'), onClick: () => d({ type: 'CONTINUE' }) },
        extra: canTryAnother(state, scenario) ? (
          <SecondaryButton
            icon={<ReplayIcon size={24} />}
            onClick={() => d({ type: 'TRY_ANOTHER' })}
            data-testid="nav-try-another"
          >
            {t('nav.tryAnother')}
          </SecondaryButton>
        ) : undefined,
      }
      break
  }

  function stepTitle(step: Step): string {
    const own = step === 'wrapup' ? undefined : scenario!.stepTitles?.[step]
    return own ? L(own) : t(`step.${step}`)
  }

  // Replay reads the most relevant text for the current screen.
  const replay = () => {
    const text = currentText()
    void speak(text)
  }
  function currentText(): string {
    switch (state!.step) {
      case 'situation': {
        const i = state!.sentenceIndex
        const s = scenario!.situation
        return i >= s.story.length ? L(s.keySentence) : L(s.story[i]!)
      }
      case 'feeling':
        return L(scenario!.feeling.question)
      case 'step3': {
        const s3 = scenario!.step3
        const f =
          s3.type === 'body-reaction' && s3.explore
            ? state!.exploredFeelingId
            : state!.feelingIds[0]
        const explanation =
          s3.type === 'reason' && f
            ? s3.byFeeling[f]
            : s3.type === 'body-reaction' && f
              ? s3.byFeeling[f]?.text
              : undefined
        const choice =
          s3.type === 'multiple-choice'
            ? s3.options.find((o) => o.id === state!.step3OptionId)
            : undefined
        return [
          L(s3.question),
          s3.type === 'body-reaction' && s3.explore && f ? L(getEmotion(f).word) : '',
          explanation && L(explanation),
          choice && L(choice.text),
          choice?.ack && L(choice.ack),
          s3.principle &&
            s3.narratePrinciple !== false &&
            !(s3.type === 'multiple-choice' && s3.principleAfterChoice && !choice) &&
            L(s3.principle),
          state!.moreShown && s3.more && L(s3.more),
        ]
          .filter(Boolean)
          .join(' ')
      }
      case 'action':
        return L(scenario!.action.question)
      case 'feedback': {
        const a = scenario!.action.options.find((o) => o.id === state!.actionId)
        return a ? `${L(a.text)} ${L(a.feedback)}` : ''
      }
      default:
        return ''
    }
  }

  return (
    <>
      <LessonShell
        screenKey={state.step}
        stepTitle={stepTitle(state.step)}
        progressIndex={progressIndex(state.step)}
        onHome={() => setConfirmHome(true)}
        onSettings={() => setSettingsOpen(true)}
        onReplay={replay}
        ttsSupported={supported}
        bottom={bottom}
        domain={scenario.domain}
      >
        {body}
      </LessonShell>

      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <Sheet
        open={confirmHome}
        onClose={() => setConfirmHome(false)}
        title={t('confirm.home')}
        modal
      >
        <div className="flex gap-3 pt-2">
          <SecondaryButton full onClick={() => setConfirmHome(false)} data-testid="confirm-no">
            {t('confirm.no')}
          </SecondaryButton>
          <PrimaryButton full onClick={exit} data-testid="confirm-yes">
            {t('confirm.yes')}
          </PrimaryButton>
        </div>
      </Sheet>
    </>
  )
}
