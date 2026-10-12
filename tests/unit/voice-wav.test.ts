import { describe, expect, it } from 'vitest'
import { concatSamples, downsample, encodeWav, peakLevel, toBase64 } from '@/voice/wav'

const ascii = (view: DataView, offset: number, length: number) =>
  Array.from({ length }, (_, i) => String.fromCharCode(view.getUint8(offset + i))).join('')

describe('wav helpers', () => {
  it('writes a 16-bit mono RIFF header the STT API accepts', () => {
    const samples = new Float32Array([0, 0.5, -0.5, 1, -1, 2, -2])
    const view = new DataView(encodeWav(samples, 16000))
    expect(ascii(view, 0, 4)).toBe('RIFF')
    expect(ascii(view, 8, 4)).toBe('WAVE')
    expect(view.getUint16(20, true)).toBe(1) // PCM
    expect(view.getUint16(22, true)).toBe(1) // mono
    expect(view.getUint32(24, true)).toBe(16000)
    expect(view.getUint16(34, true)).toBe(16)
    expect(view.getUint32(40, true)).toBe(samples.length * 2)
    expect(view.getInt16(44, true)).toBe(0)
    expect(view.getInt16(46, true)).toBe(Math.trunc(0.5 * 0x7fff))
    expect(view.getInt16(50, true)).toBe(0x7fff)
    expect(view.getInt16(52, true)).toBe(-0x8000)
    // out-of-range input is clamped, never wrapped
    expect(view.getInt16(54, true)).toBe(0x7fff)
    expect(view.getInt16(56, true)).toBe(-0x8000)
  })

  it('downsamples by the rate ratio and keeps a constant signal constant', () => {
    const input = new Float32Array(48000).fill(0.25)
    const out = downsample(input, 48000, 16000)
    expect(out.length).toBe(16000)
    expect(out.every((v) => Math.abs(v - 0.25) < 1e-6)).toBe(true)
    expect(downsample(input, 16000, 16000)).toBe(input)
  })

  it('concatenates chunks and measures the peak', () => {
    const all = concatSamples([new Float32Array([0.1, -0.7]), new Float32Array([0.2])])
    expect(Array.from(all)).toEqual([
      0.1 - 0.1 + 0.10000000149011612,
      -0.699999988079071,
      0.20000000298023224,
    ])
    expect(peakLevel(all)).toBeCloseTo(0.7)
  })

  it('base64 starts with the RIFF signature', () => {
    expect(toBase64(encodeWav(new Float32Array(10), 16000)).startsWith('UklGR')).toBe(true)
  })
})
