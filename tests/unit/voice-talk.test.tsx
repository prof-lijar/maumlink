import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSettings } from '@/services/settings'
import { VoiceError, type Recording } from '@/voice/recorder'

const recording: Recording = { audio: 'UklGR', sampleRate: 16000, durationMs: 900 }
const recorder = { stop: vi.fn(async () => recording), cancel: vi.fn() }
const startRecording = vi.fn(async () => recorder)
const runVoiceTurn = vi.fn(async () => ({
  transcript: '친구가 안 불러서 속상했어요',
  reply: '그렇게 느낄 수 있어요.',
}))
const voiceHealth = vi.fn(async () => ({ stt: true, ai: true, tts: false }))

vi.mock('@/voice/recorder', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/voice/recorder')>()),
  microphoneSupported: () => true,
  startRecording: (...args: unknown[]) => startRecording(...(args as [])),
}))
vi.mock('@/voice/voiceApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/voice/voiceApi')>()),
  voiceHealth: () => voiceHealth(),
  runVoiceTurn: (...args: unknown[]) => runVoiceTurn(...(args as [])),
}))

const { VoiceTalk } = await import('@/voice/VoiceTalk')
const context = {
  story: '친구들과 함께 놀고 싶어요',
  prompt: '어떤 기분이 들까요?',
  options: ['속상해요'],
}

beforeEach(() => {
  vi.clearAllMocks()
  useSettings.setState({ voiceInput: false })
})

describe('말로 이야기하기', () => {
  it('stays hidden until an adult switches it on and the server has keys', async () => {
    const { rerender } = render(<VoiceTalk context={context} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    act(() => useSettings.setState({ voiceInput: true }))
    rerender(<VoiceTalk context={context} />)
    expect(await screen.findByRole('button', { name: '말로 이야기해 볼래요' })).toBeInTheDocument()
    expect(voiceHealth).toHaveBeenCalled()
  })

  it('stays hidden when the server lacks speech or AI keys', async () => {
    voiceHealth.mockResolvedValueOnce({ stt: true, ai: false, tts: true })
    useSettings.setState({ voiceInput: true })
    render(<VoiceTalk context={context} />)
    await act(async () => {
      await Promise.resolve()
    })
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('records, shows what was heard and the reply, and offers to try again', async () => {
    useSettings.setState({ voiceInput: true })
    const user = userEvent.setup()
    render(<VoiceTalk context={context} face="/img/v3/char-sora-400.webp" />)
    await user.click(await screen.findByRole('button', { name: '말로 이야기해 볼래요' }))
    expect(screen.getByRole('status')).toHaveTextContent('마이크를 누르고 내 마음을 말해 보아요.')
    await user.click(screen.getByRole('button', { name: '말하기 시작' }))
    expect(startRecording).toHaveBeenCalledTimes(1)
    await user.click(await screen.findByRole('button', { name: '말하기 끝내기' }))
    expect(screen.getByRole('status')).toHaveTextContent(/생각하고 있어요|잘 들었어요/)
    expect(recorder.stop).toHaveBeenCalledTimes(1)
    expect(runVoiceTurn).toHaveBeenCalledWith(recording, context, expect.any(AbortSignal))
    expect(await screen.findByText('친구가 안 불러서 속상했어요')).toBeInTheDocument()
    expect(screen.getByText('그렇게 느낄 수 있어요.')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: '다시 말하기' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '다시 듣기' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('잘 들었어요!')
    await user.click(screen.getByRole('button', { name: '닫기' }))
    expect(screen.getByRole('button', { name: '말로 이야기해 볼래요' })).toBeInTheDocument()
  })

  it('explains in child words when nothing was heard or the microphone is blocked', async () => {
    useSettings.setState({ voiceInput: true })
    runVoiceTurn.mockRejectedValueOnce(new VoiceError('nothing-heard'))
    const user = userEvent.setup()
    render(<VoiceTalk context={context} />)
    await user.click(await screen.findByRole('button', { name: '말로 이야기해 볼래요' }))
    await user.click(screen.getByRole('button', { name: '말하기 시작' }))
    await user.click(await screen.findByRole('button', { name: '말하기 끝내기' }))
    expect(await screen.findByText(/잘 들리지 않았어요/)).toBeInTheDocument()
    startRecording.mockRejectedValueOnce(new VoiceError('mic-denied'))
    await user.click(screen.getByRole('button', { name: '다시 말하기' }))
    expect(await screen.findByText(/마이크를 쓸 수 없어요/)).toBeInTheDocument()
  })
})
