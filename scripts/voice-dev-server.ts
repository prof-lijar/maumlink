/**
 * Mounts the voice API (server/voice/router.ts) on the Vite dev and preview servers so
 * `pnpm dev` works without the Vercel CLI. Provider keys come from `.env.dev` (gitignored);
 * see `.env.dev.example`.
 */
import { existsSync, readFileSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'
import { handleVoiceRequest } from '../server/voice/router'

export const VOICE_ENV_FILE = '.env.dev'

/**
 * Loads `.env.dev` into process.env, overriding earlier values so an edited key takes effect
 * on the next (re)start. (`process.loadEnvFile` keeps existing variables, which left a stale
 * key in a long-running dev server.)
 */
export function loadVoiceEnv(root: string, file = VOICE_ENV_FILE): boolean {
  const path = resolve(root, file)
  if (!existsSync(path)) return false
  try {
    for (const [key, value] of Object.entries(parseEnvFile(readFileSync(path, 'utf8'))))
      process.env[key] = value
    return true
  } catch {
    return false
  }
}

/** Minimal dotenv parser: KEY=value lines, optional quotes, `#` comments, no interpolation. */
export function parseEnvFile(text: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq <= 0) continue
    const key = line
      .slice(0, eq)
      .trim()
      .replace(/^export\s+/, '')
    let value = line.slice(eq + 1).trim()
    const quoted = /^(['"`])(.*)\1$/.exec(value)
    if (quoted) value = quoted[2]!
    else value = value.replace(/\s+#.*$/, '').trim()
    out[key] = value
  }
  return out
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
    configureServer: (server) => {
      mount(server.middlewares)
      // Editing .env.dev (new keys, another provider) restarts the dev server so it applies.
      const envPath = resolve(root, VOICE_ENV_FILE)
      server.watcher.add(envPath)
      server.watcher.on('change', (file) => {
        if (file === envPath) {
          server.config.logger.info('.env.dev changed — restarting to apply the voice keys')
          void server.restart()
        }
      })
    },
    configurePreviewServer: (server) => mount(server.middlewares),
  }
}
