// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { parseEnvFile } from '../../scripts/voice-dev-server'

describe('.env.dev parser', () => {
  it('reads KEY=value lines with quotes and comments, ignoring the rest', () => {
    expect(
      parseEnvFile(`# keys
GOOGLE_AI_API_KEY=AQ.abc
ELEVENLABS_API_KEY="sk_1"
export VOICE_STT_PROVIDER='elevenlabs'
GOOGLE_STT_MODE=smart # tidy
EMPTY=
not a pair
`),
    ).toEqual({
      GOOGLE_AI_API_KEY: 'AQ.abc',
      ELEVENLABS_API_KEY: 'sk_1',
      VOICE_STT_PROVIDER: 'elevenlabs',
      GOOGLE_STT_MODE: 'smart',
      EMPTY: '',
    })
  })
})
