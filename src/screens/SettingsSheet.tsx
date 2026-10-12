import { Sheet } from '@/design/Sheet'
import { useT } from '@/i18n/useT'
import { useSettings } from '@/services/settings'
import { sound } from '@/services/sound'
import { speech } from '@/services/speech'
import { speechStatusKey, useSpeechStatus } from '@/services/useSpeechStatus'
import { useSpeak } from '@/services/useSpeak'
import { SecondaryButton } from '@/design/Button'
import { CheckIcon, SpeakerIcon } from '@/design/icons'
import { avatarArt, avatarNames } from '@/design/devkitAssets'
import { avatarIds, useProfile } from '@/services/profile'

const avatarOptions = avatarIds.map((id) => ({ id, label: avatarNames[id] }))

/** Lets an adult change the explorer avatar chosen on first run (stored in the profile). */
function AvatarPicker() {
  const avatarId = useProfile((state) => state.avatarId)
  const chooseAvatar = useProfile((state) => state.chooseAvatar)
  return (
    <div
      role="radiogroup"
      aria-label="탐험가 바꾸기"
      className="character-grid character-grid--compact"
    >
      {avatarOptions.map((avatar) => {
        const on = avatar.id === avatarId
        return (
          <button
            key={avatar.id}
            type="button"
            role="radio"
            aria-checked={on}
            className="character-option tap"
            onClick={() => {
              sound.play('tick')
              chooseAvatar(avatar.id)
            }}
          >
            <img src={avatarArt[avatar.id]} alt="" width={400} height={600} />
            <span>{avatar.label}</span>
            {on && (
              <span className="character-check" aria-hidden="true">
                <CheckIcon size={18} />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

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
              void speak(t('voice.sample'))
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
        <Segmented
          label="말로 이야기하기"
          value={s.voiceInput ? 'on' : 'off'}
          options={[
            { value: 'on', label: t('settings.on') },
            { value: 'off', label: t('settings.off') },
          ]}
          onChange={(v) => s.setVoiceInput(v === 'on')}
        />
        <p className="settings-note text-caption text-ink-soft">
          켜면 이야기 화면에 마이크 버튼이 생겨요. 아이가 말한 목소리는 인터넷 음성
          서비스(ElevenLabs)로 보내 글로 바꾸고, AI(Google)가 짧게 대답한 뒤 같은 목소리로 읽어
          줘요. 기기나 서버에 녹음을 남기지 않아요. 인터넷이 없으면 버튼이 보이지 않아요.
        </p>
        <div className="settings-row">
          <span className="text-body font-bold text-ink">탐험가 바꾸기</span>
          <AvatarPicker />
        </div>
      </div>
    </Sheet>
  )
}
