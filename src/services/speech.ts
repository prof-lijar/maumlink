/** One cancellable narration queue shared by automatic and manual reading. */
import type { Locale } from './settings'
import { activeNarrationVoice } from './narration/voices'
import { resolveRecordedNarration } from './recordedNarration'

export interface SpeakRequest {
  text: string
  locale: Locale
  audioUrl?: string
  automatic?: boolean
}
export interface SpeechStatus {
  phase: 'idle' | 'loading' | 'blocked' | 'speaking' | 'error'
  error?: string
  voice?: string
}
type Listener = (speaking: boolean) => void
const LANG: Record<Locale, string> = { ko: 'ko-KR', en: 'en-US' }
// Slow, clearly separated sentences for slow learners (client review 2026-10-07).
const RATE = 0.8
// Each recorded voice set declares its own playback speed (Kyung was generated fast, 1.06).
const AUDIO_RATE = activeNarrationVoice.playbackRate
const VOICE_WAIT_MS = 1500
const START_WAIT_MS = 4000

class SpeechService {
  private enabled = true
  private activationRequired = false
  private activationListeners = new Set<() => void>()
  private status: SpeechStatus = { phase: 'idle' }
  private statusListeners = new Set<() => void>()
  private request?: SpeakRequest
  private textListeners = new Set<(text: string) => void>()
  // Retaining the utterance also keeps it alive until its browser callbacks finish.
  private current?: { cancel: () => void; utterance?: SpeechSynthesisUtterance }
  private listeners = new Set<Listener>()
  private audio?: HTMLAudioElement
  unlocked = false

  isSupported(): boolean {
    return typeof Audio !== 'undefined' || this.isSynthesisSupported()
  }
  private isSynthesisSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      Boolean(window.speechSynthesis) &&
      typeof window.SpeechSynthesisUtterance === 'function'
    )
  }
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    if (!enabled) {
      this.cancel()
      this.setStatus({ phase: 'idle' })
    }
  }
  getStatus = (): SpeechStatus => this.status
  onStatusChange = (listener: () => void): (() => void) => {
    this.statusListeners.add(listener)
    return () => this.statusListeners.delete(listener)
  }
  private setStatus(status: SpeechStatus): void {
    this.status = status
    for (const listener of this.statusListeners) listener()
    for (const listener of this.listeners) listener(status.phase === 'speaking')
  }
  getActivationRequired = (): boolean => this.activationRequired
  onActivationChange = (listener: () => void): (() => void) => {
    this.activationListeners.add(listener)
    return () => this.activationListeners.delete(listener)
  }
  private setActivationRequired(required: boolean): void {
    if (this.activationRequired === required) return
    this.activationRequired = required
    for (const listener of this.activationListeners) listener()
  }
  private waitForActivation(req: SpeakRequest): Promise<void> {
    return new Promise((resolve) => {
      const cleanup = () => {
        document.removeEventListener('click', retry)
        document.removeEventListener('keydown', retry)
        if (this.current?.cancel === cancel) this.current = undefined
        this.setActivationRequired(false)
      }
      const cancel = () => {
        cleanup()
        this.setStatus({ phase: 'idle' })
        resolve()
      }
      const retry = (event: Event) => {
        if (
          event instanceof KeyboardEvent &&
          ['Tab', 'Escape', 'Shift', 'Control', 'Alt', 'Meta'].includes(event.key)
        )
          return
        if (this.request !== req || !this.enabled) return cancel()
        cleanup()
        this.unlocked = true
        void this.speak(req).then(resolve)
      }
      this.current = { cancel }
      document.addEventListener('click', retry)
      document.addEventListener('keydown', retry)
      this.setActivationRequired(true)
      this.setStatus({ phase: 'blocked' })
    })
  }
  onChange(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
  onText(listener: (text: string) => void): () => void {
    this.textListeners.add(listener)
    return () => {
      this.textListeners.delete(listener)
    }
  }
  private voicesFor(locale: Locale): SpeechSynthesisVoice[] {
    // Re-query for every request: Chrome's voice inventory is populated asynchronously.
    const voices = window.speechSynthesis
      .getVoices()
      .filter((voice) => voice.lang.toLowerCase().replaceAll('_', '-').split('-')[0] === locale)
    const score = (voice: SpeechSynthesisVoice) =>
      (voice.localService ? 100 : 0) +
      (/yuna|siri|natural|premium|enhanced/i.test(voice.name) ? 10 : 0)
    return voices.sort((a, b) => score(b) - score(a))
  }
  /** Called only by an explicit interaction. Real narration, not a silent cancelled
   * utterance, performs the browser's audio activation. */
  unlock(): void {
    this.unlocked = true
    try {
      if (this.isSynthesisSupported()) window.speechSynthesis.resume()
    } catch {
      /* The following real request reports an engine failure. */
    }
  }
  cancel(request?: SpeakRequest): void {
    if (request && request !== this.request) return
    this.current?.cancel()
    this.current = undefined
    this.request = undefined
  }
  speak(req: SpeakRequest): Promise<void> {
    this.cancel()
    this.request = req
    for (const listener of this.textListeners) listener(req.text)
    if (!this.enabled || (!req.text.trim() && !req.audioUrl)) return Promise.resolve()
    if (req.automatic && !this.unlocked && navigator.userActivation?.hasBeenActive === false)
      return this.waitForActivation(req)
    const recordings = req.audioUrl
      ? [req.audioUrl]
      : resolveRecordedNarration(req.text, req.locale)
    if (recordings && typeof Audio !== 'undefined') return this.playAudio(req, recordings)
    if (!this.isSynthesisSupported()) {
      this.setStatus({ phase: 'error', error: 'synthesis-unavailable' })
      return Promise.resolve()
    }
    return this.synthesize(req)
  }
  private synthesize(req: SpeakRequest): Promise<void> {
    return new Promise((resolve) => {
      const synth = window.speechSynthesis
      let done = false
      let utterance: SpeechSynthesisUtterance | undefined
      let timer: ReturnType<typeof setTimeout> | undefined
      let voiceListener: (() => void) | undefined
      let attempts: Array<SpeechSynthesisVoice | undefined> = []
      let attempt = 0
      const clearAttempt = () => {
        clearTimeout(timer)
        if (utterance) utterance.onstart = utterance.onend = utterance.onerror = null
        utterance = undefined
      }
      const finish = (error?: string) => {
        if (done) return
        done = true
        clearAttempt()
        if (voiceListener) synth.removeEventListener?.('voiceschanged', voiceListener)
        if (this.current?.cancel === cancel) this.current = undefined
        this.setStatus({ phase: error ? 'error' : 'idle', error, voice: this.status.voice })
        resolve()
      }
      const cancel = () => {
        finish()
        try {
          synth.cancel()
        } catch {
          /* no active engine */
        }
      }
      const retry = (error: string) => {
        if (done) return
        clearAttempt()
        try {
          synth.cancel()
        } catch {
          /* try the next available voice */
        }
        if (error === 'not-allowed') {
          finish()
          if (this.request === req && this.enabled) void this.waitForActivation(req)
        } else if (attempt < attempts.length && !['audio-busy', 'audio-hardware'].includes(error)) {
          // Yield after cancel so Chrome can release the old native utterance.
          timer = setTimeout(startAttempt, 0)
        } else finish(error)
      }
      const startAttempt = () => {
        if (done) return
        const voice = attempts[attempt++]
        const u = new SpeechSynthesisUtterance(req.text)
        utterance = u
        u.lang = LANG[req.locale]
        u.rate = RATE
        u.pitch = 1
        u.volume = 1
        if (voice) u.voice = voice
        this.current = { cancel, utterance: u }
        this.setStatus({ phase: 'loading', voice: voice?.name })
        u.onstart = () => {
          if (done || utterance !== u) return
          clearTimeout(timer)
          this.setStatus({ phase: 'speaking', voice: voice?.name })
        }
        u.onend = () => {
          if (!done && utterance === u) finish()
        }
        u.onerror = (event) => {
          if (!done && utterance === u) retry(event.error)
        }
        timer = setTimeout(() => retry('start-timeout'), START_WAIT_MS)
        try {
          synth.resume()
          synth.speak(u)
        } catch {
          retry('synthesis-failed')
        }
      }
      const loadVoices = (final = false) => {
        if (done) return
        const voices = this.voicesFor(req.locale)
        if (!voices.length && !final) return
        clearTimeout(timer)
        if (voiceListener) synth.removeEventListener?.('voiceschanged', voiceListener)
        // Two real locale-matching voices, then the browser's locale-aware default.
        // Never explicitly substitute an English voice for a Korean request.
        attempts = [...voices.slice(0, 2), undefined]
        startAttempt()
      }
      this.current = { cancel }
      this.setStatus({ phase: 'loading' })
      if (this.voicesFor(req.locale).length) loadVoices()
      else {
        voiceListener = () => loadVoices()
        synth.addEventListener?.('voiceschanged', voiceListener)
        timer = setTimeout(() => loadVoices(true), VOICE_WAIT_MS)
      }
    })
  }
  private playAudio(req: SpeakRequest, urls: string[]): Promise<void> {
    return new Promise((resolve) => {
      const el = this.audio ?? (this.audio = new Audio())
      let done = false
      let index = 0
      const finish = (error?: string) => {
        if (done) return
        done = true
        el.onplaying = el.onended = el.onerror = null
        if (this.current?.cancel === cancel) this.current = undefined
        this.setStatus({ phase: error ? 'error' : 'idle', error })
        resolve()
      }
      const cancel = () => {
        finish()
        el.pause()
      }
      el.onplaying = () => {
        if (!done) this.setStatus({ phase: 'speaking' })
      }
      el.onended = () => {
        if (done) return
        index += 1
        if (index < urls.length) startClip()
        else finish()
      }
      el.onerror = () => finish('audio-unavailable')
      const startClip = () => {
        if (done || this.request !== req || !this.enabled) return
        el.src = urls[index]!
        slowDown(el)
        this.current = { cancel }
        this.setStatus({ phase: 'loading' })
        // play() may return undefined (jsdom) or throw synchronously; treat both as rejections.
        let started: Promise<void> | undefined
        try {
          started = el.play()
        } catch (error) {
          started = Promise.reject(error)
        }
        void Promise.resolve(started).catch((error: unknown) => {
          if (done) return
          if (error instanceof Error && error.name === 'NotAllowedError') {
            finish()
            if (this.request === req && this.enabled) void this.waitForActivation(req)
          } else finish('audio-unavailable')
        })
      }
      startClip()
    })
  }
}
/** Loading a new source resets playbackRate to defaultPlaybackRate, so set both per clip. */
function slowDown(el: HTMLAudioElement): void {
  const media = el as HTMLAudioElement & { webkitPreservesPitch?: boolean }
  media.preservesPitch = true
  media.webkitPreservesPitch = true
  el.defaultPlaybackRate = AUDIO_RATE
  el.playbackRate = AUDIO_RATE
}
export const speech = new SpeechService()
