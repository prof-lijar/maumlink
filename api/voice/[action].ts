// Vercel Function (Node.js runtime) for every /api/voice/* action. The default export with
// `fetch` is the documented web-standard form for files under api/; the logic lives in
// server/voice so the Vite dev server and unit tests run the same code.
import { handleVoiceRequest } from '../../server/voice/router.js'

export const config = { maxDuration: 30 }

export default {
  fetch(request: Request): Promise<Response> {
    return handleVoiceRequest(request)
  },
}
