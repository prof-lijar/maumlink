#!/usr/bin/env tsx
/**
 * `pnpm art:build` — turns the raw Codex renders in content-source/art/raw into
 * optimised web assets under public/img/v3 (PRD §9 budgets, FR-RES-06):
 *   transparent sprites → <id>-400.webp, <id>-800.webp (alpha kept, trimmed)
 *   scenes              → <id>-800.webp, <id>-1600.webp, <id>.png (800 px) fallback
 */
import { mkdirSync, readFileSync, readdirSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import sharp from 'sharp'

const root = fileURLToPath(new URL('..', import.meta.url))
const artDir = join(root, 'content-source', 'art')
const rawDir = join(artDir, 'raw')
const outDir = join(root, 'public', 'img', 'v3')
mkdirSync(outDir, { recursive: true })

interface Item {
  id: string
  group: string
  transparent: boolean
}
const manifest = JSON.parse(readFileSync(join(artDir, 'manifest.json'), 'utf8')) as {
  items: Item[]
}
const byId = new Map(manifest.items.map((it) => [it.id, it]))

for (const file of readdirSync(rawDir)) {
  if (!/\.png$/i.test(file)) continue
  const id = basename(file, extname(file))
  const item = byId.get(id)
  if (!item) continue
  const input = sharp(join(rawDir, file))
  if (item.transparent) {
    // Trim transparent padding so CSS sizing is predictable, keep alpha.
    const trimmed = await input.trim({ threshold: 8 }).toBuffer()
    for (const width of [400, 800] as const) {
      await sharp(trimmed)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 86, alphaQuality: 90 })
        .toFile(join(outDir, `${id}-${width}.webp`))
    }
  } else {
    for (const width of [800, 1600] as const) {
      await input
        .clone()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(join(outDir, `${id}-${width}.webp`))
    }
    // PNG fallback only for pictures that are used as <img src>; 800 px keeps it small.
    if (item.group === 'scenes' && id.startsWith('scene-'))
      await input
        .clone()
        .resize({ width: 800, withoutEnlargement: true })
        .png({ compressionLevel: 9, palette: true })
        .toFile(join(outDir, `${id}.png`))
  }
  console.log(`✔ ${id}`)
}
