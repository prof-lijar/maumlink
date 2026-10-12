// Vercel Function (Node.js runtime, web handler signature) for every /api/voice/* action.
// The logic lives in server/voice so the Vite dev server and unit tests run the same code.
import { handleVoiceRequest } from '../../server/voice/router'

export const maxDuration = 30

export const GET = (request: Request) => handleVoiceRequest(request)
export const POST = (request: Request) => handleVoiceRequest(request)
export const OPTIONS = (request: Request) => handleVoiceRequest(request)
