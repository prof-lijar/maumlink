/**
 * Mounts the voice API (server/voice/router.ts) on the Vite dev and preview servers so
 * `pnpm dev` works without the Vercel CLI. Provider keys come from `.env.dev` (gitignored);
 * see `.env.dev.example`.
 */
import { existsSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'
import { handleVoiceRequest } from '../server/voice/router'

export const VOICE_ENV_FILE = '.env.dev'

/** Loads `.env.dev` into process.env once (Node 20.12+ has loadEnvFile built in). */
export function loadVoiceEnv(root: string, file = VOICE_ENV_FILE): boolean {
  const path = resolve(root, file)
  if (!existsSync(path)) return false
  try {
    process.loadEnvFile(path)
    return true
  } catch {
    return false
  }
}

async function toRequest(req: IncomingMessage): Promise<Request> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  const host = req.headers.host ?? 'localhost'
  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers))
    if (typeof value === 'string') headers.set(key, value)
  const method = req.method ?? 'GET'
  return new Request(`http://${host}${req.url ?? '/'}`, {
    method,
    headers,
    body: method === 'GET' || method === 'HEAD' ? undefined : Buffer.concat(chunks),
  })
}

async function send(response: Response, res: ServerResponse): Promise<void> {
  res.statusCode = response.status
  response.headers.forEach((value, key) => res.setHeader(key, value))
  res.end(Buffer.from(await response.arrayBuffer()))
}

export function voiceDevServer(root: string): Plugin {
  const mount = (middlewares: {
    use: (path: string, handler: (req: IncomingMessage, res: ServerResponse) => void) => void
  }) => {
    loadVoiceEnv(root)
    middlewares.use('/api/voice', (req, res) => {
      // Vite strips the mount path; put it back so the router sees the full URL.
      req.url = `/api/voice${req.url ?? ''}`
      void toRequest(req)
        .then(handleVoiceRequest)
        .then((response) => send(response, res))
        .catch((error: unknown) => {
          res.statusCode = 500
          res.end(error instanceof Error ? error.message : 'voice request failed')
        })
    })
  }
  return {
    name: 'maumlink:voice-api',
    configureServer: (server) => mount(server.middlewares),
    configurePreviewServer: (server) => mount(server.middlewares),
  }
}
