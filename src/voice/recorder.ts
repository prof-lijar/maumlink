/**
 * Microphone capture as raw PCM through the Web Audio API, so every browser (Chrome, Safari,
 * the Android WebView) yields the same 16 kHz WAV regardless of MediaRecorder codec support.
 */
import {
  concatSamples,
  downsample,
  encodeWav,
  peakLevel,
  TARGET_SAMPLE_RATE,
  toBase64,
} from './wav'

export type VoiceErrorCode =
  'mic-denied' | 'mic-unavailable' | 'offline' | 'nothing-heard' | 'server'

export class VoiceError extends Error {
  code: VoiceErrorCode
  constructor(code: VoiceErrorCode, message?: string) {
    super(message ?? code)
    this.code = code
  }
}

export interface Recording {
  /** Base64 16-bit mono WAV. */
  audio: string
  sampleRate: number
  durationMs: number
}

export interface Recorder {
  stop: () => Promise<Recording>
  cancel: () => void
}

export interface RecorderOptions {
  /** Hard stop so a forgotten microphone never records for long (default 15 s). */
  maxMs?: number
  onLevel?: (level: number) => void
  onAutoStop?: () => void
}

export const MAX_RECORDING_MS = 15_000

export function microphoneSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof (
      window.AudioContext ?? (window as { webkitAudioContext?: unknown }).webkitAudioContext
    ) === 'function'
  )
}

export async function startRecording(options: RecorderOptions = {}): Promise<Recorder> {
  if (!microphoneSupported()) throw new VoiceError('mic-unavailable')
  let stream: MediaStream
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
    })
  } catch (error) {
    const name = error instanceof Error ? error.name : ''
    throw new VoiceError(
      name === 'NotAllowedError' || name === 'SecurityError' ? 'mic-denied' : 'mic-unavailable',
    )
  }
  const AudioContextCtor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  const context = new AudioContextCtor()
  const source = context.createMediaStreamSource(stream)
  // ScriptProcessorNode is deprecated but universally available and needs no worklet file.
  const processor = context.createScriptProcessor(4096, 1, 1)
  const chunks: Float32Array[] = []
  const startedAt = Date.now()
  let finished = false
  processor.onaudioprocess = (event) => {
    if (finished) return
    const data = event.inputBuffer.getChannelData(0)
    chunks.push(new Float32Array(data))
    options.onLevel?.(peakLevel(data))
  }
  source.connect(processor)
  processor.connect(context.destination)
  if (context.state === 'suspended') void context.resume()

  const release = () => {
    if (finished) return
    finished = true
    clearTimeout(timer)
    processor.onaudioprocess = null
    try {
      source.disconnect()
      processor.disconnect()
    } catch {
      // Nodes may already be gone when the page is leaving.
    }
    for (const track of stream.getTracks()) track.stop()
    void context.close().catch(() => undefined)
  }
  const timer = setTimeout(() => {
    if (!finished) options.onAutoStop?.()
  }, options.maxMs ?? MAX_RECORDING_MS)

  return {
    stop: async () => {
      const inputRate = context.sampleRate
      release()
      const samples = downsample(concatSamples(chunks), inputRate, TARGET_SAMPLE_RATE)
      return {
        audio: toBase64(encodeWav(samples, TARGET_SAMPLE_RATE)),
        sampleRate: TARGET_SAMPLE_RATE,
        durationMs: Date.now() - startedAt,
      }
    },
    cancel: release,
  }
}
