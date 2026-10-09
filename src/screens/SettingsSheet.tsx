import { Sheet } from '@/design/Sheet'
import { useT } from '@/i18n/useT'
import { useSettings } from '@/services/settings'
import { sound } from '@/services/sound'
import { speech } from '@/services/speech'
import { speechStatusKey, useSpeechStatus } from '@/services/useSpeechStatus'
import { useSpeak } from '@/services/useSpeak'
import { SecondaryButton } from '@/design/Button'
import { SpeakerIcon } from '@/design/icons'
import { CharacterPicker } from './CharacterPick'

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="settings-row">
      <span className="text-body font-bold text-ink">{label}</span>
      <div role="radiogroup" aria-label={label} className="settings-segments">
        {options.map((o) => {
          const on = o.value === value
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={on}
              className="settings-option tap"
              onKeyDown={(event) => {
                if (
                  !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(
                    event.key,
                  )
                )
                  return
                event.preventDefault()
                const buttons = Array.from(
                  event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
                    '[role="radio"]',
                  ) ?? [],
                )
                const index = buttons.indexOf(event.currentTarget)
                const next =
                  event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? buttons.length - 1
                      : (index +
                          (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) +
                          buttons.length) %
                        buttons.length
                buttons[next]?.focus()
                buttons[next]?.click()
              }}
              onClick={() => {
                sound.play('tick')
                onChange(o.value)
              }}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** PRD §6.7 / FR-SET-01 — text size, sound, auto-read, companion. No language control (D17). */
export function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useT()
  const s = useSettings()
  const status = useSpeechStatus()
  const { speak } = useSpeak()
  return (
    <Sheet open={open} onClose={onClose} title={t('settings.title')}>
      <div className="divide-y divide-line">
        <div className="settings-row">
          <SecondaryButton
            icon={<SpeakerIcon />}
            onClick={() => {
              s.setVoiceEnabled(true)
              speech.unlock()
              void speak(t('home.greeting'))
            }}
          >
            {t('voice.test')}
          </SecondaryButton>
          <p role="status" className="text-caption text-ink-soft">
            {t(s.voiceEnabled ? speechStatusKey(status) : 'voice.status.off')}
          </p>
          {status.voice && <p className="text-caption text-ink-soft">{status.voice}</p>}
        </div>
        <Segmented
          label={t('settings.textSize')}
          value={s.textSize}
          options={[
            { value: 'normal', label: t('settings.textNormal') },
            { value: 'large', label: t('settings.textLarge') },
          ]}
          onChange={s.setTextSize}
        />
        <Segmented
          label={t('settings.sound')}
          value={s.sound ? 'on' : 'off'}
          options={[
            { value: 'on', label: t('settings.on') },
            { value: 'off', label: t('settings.off') },
          ]}
          onChange={(v) => {
            s.setSound(v === 'on')
            sound.setEnabled(v === 'on')
          }}
        />
        <Segmented
          label={t('settings.autoRead')}
          value={s.autoRead ? 'on' : 'off'}
          options={[
            { value: 'on', label: t('settings.on') },
            { value: 'off', label: t('settings.off') },
          ]}
          onChange={(v) => s.setAutoRead(v === 'on')}
        />
        <div className="settings-row">
          <span className="text-body font-bold text-ink">{t('character.change')}</span>
          <CharacterPicker compact />
        </div>
      </div>
    </Sheet>
  )
}
