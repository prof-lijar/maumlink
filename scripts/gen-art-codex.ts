#!/usr/bin/env tsx
/**
 * `pnpm art:generate [--only id,id] [--force] [--concurrency 4]`
 *
 * Generates the cartoon character / place / face / scene artwork listed in
 * content-source/art/manifest.json with the Codex CLI's built-in image generation
 * tool (`codex exec`), using the reference pictures in content-source/art/refs for
 * style consistency. Raw PNGs land in content-source/art/raw/<id>.png; run
 * `pnpm art:build` afterwards to produce the optimised web assets in public/img/v3.
 *
 * Nothing here runs at app runtime: generation is a one-off authoring step.
 */
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

interface Item {
  id: string
  group: string
  size: 'portrait' | 'square' | 'landscape'
  transparent: boolean
  refs: string[]
  prompt: string
}
interface Manifest {
  style: string
  sizes: Record<Item['size'], string>
  items: Item[]
}

const root = fileURLToPath(new URL('..', import.meta.url))
const artDir = join(root, 'content-source', 'art')
const rawDir = join(artDir, 'raw')
const refDir = join(artDir, 'refs')
mkdirSync(rawDir, { recursive: true })

const manifest = JSON.parse(readFileSync(join(artDir, 'manifest.json'), 'utf8')) as Manifest

const args = process.argv.slice(2)
const flag = (name: string) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
const force = args.includes('--force')
const only = flag('--only')?.split(',').filter(Boolean)
const concurrency = Number(flag('--concurrency') ?? 4)

const queue = manifest.items.filter((it) => !only || only.includes(it.id))

function buildPrompt(it: Item): string {
  const size = manifest.sizes[it.size]
  const bg = it.transparent
    ? 'TRANSPARENT background (PNG with an alpha channel, nothing behind the subject).'
    : 'Full-canvas scene with no transparent areas.'
  return [
    `Use your image generation tool to create ONE ${size} image (${it.size}).`,
    it.prompt,
    manifest.style,
    bg,
    `Save the resulting PNG into the current working directory as exactly "${it.id}.png" (overwrite if present).`,
    'Do not create, edit or delete any other file. Reply with one line when done.',
  ].join('\n\n')
}

function run(it: Item): Promise<{ id: string; ok: boolean; note: string }> {
  const out = join(rawDir, `${it.id}.png`)
  if (!force && existsSync(out) && statSync(out).size > 0)
    return Promise.resolve({ id: it.id, ok: true, note: 'exists' })
  const argv = ['exec', '--skip-git-repo-check', '--sandbox', 'workspace-write', '-C', rawDir]
  for (const r of it.refs) argv.push('-i', join(refDir, r))
  argv.push('--', buildPrompt(it))
  return new Promise((resolve) => {
    const started = Date.now()
    const child = spawn('codex', argv, { stdio: ['ignore', 'pipe', 'pipe'] })
    let log = ''
    child.stdout.on('data', (d) => (log += d))
    child.stderr.on('data', (d) => (log += d))
    const timer = setTimeout(() => child.kill('SIGKILL'), 8 * 60_000)
    child.on('close', () => {
      clearTimeout(timer)
      const ok = existsSync(out) && statSync(out).size > 0
      const secs = Math.round((Date.now() - started) / 1000)
      if (!ok) console.error(`--- codex log for ${it.id} ---\n${log.slice(-1500)}`)
      resolve({ id: it.id, ok, note: ok ? `${secs}s` : 'missing output' })
    })
  })
}

async function main() {
  console.log(`Generating ${queue.length} image(s) with concurrency ${concurrency}…`)
  const results: Awaited<ReturnType<typeof run>>[] = []
  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
      while (next < queue.length) {
        const it = queue[next++]!
        const r = await run(it)
        results.push(r)
        console.log(`${r.ok ? '✔' : '✘'} ${r.id} (${r.note})`)
      }
    }),
  )
  const failed = results.filter((r) => !r.ok)
  if (failed.length) {
    console.error(`\n${failed.length} failed: ${failed.map((f) => f.id).join(', ')}`)
    process.exit(1)
  }
}

void main()
