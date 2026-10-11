/**
 * UI-string validator core. Pure Node (no Vite), so it runs from the CLI, from the Vite
 * build plugin and from unit tests. Episode content is checked by validate-behavior-content.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { UiFile } from '../src/content/schema.ts'

export interface Issue {
  file: string
  path: string
  message: string
}
export interface Report {
  errors: Issue[]
  warnings: Issue[]
}

export function validateAll(root: string): Report {
  const errors: Issue[] = []
  const warnings: Issue[] = []
  const uiPath = join(root, 'content', 'ui.json')
  if (!existsSync(uiPath)) {
    errors.push({ file: 'content/ui.json', path: '', message: 'file is missing' })
    return { errors, warnings }
  }
  let raw: unknown
  try {
    raw = JSON.parse(readFileSync(uiPath, 'utf8'))
  } catch (error) {
    errors.push({ file: 'content/ui.json', path: '', message: `invalid JSON: ${String(error)}` })
    return { errors, warnings }
  }
  const parsed = UiFile.safeParse(raw)
  if (!parsed.success) {
    for (const i of parsed.error.issues)
      errors.push({ file: 'content/ui.json', path: i.path.join('.'), message: i.message })
    return { errors, warnings }
  }
  for (const [key, value] of Object.entries(parsed.data))
    if (!value.en)
      warnings.push({
        file: 'content/ui.json',
        path: key,
        message: 'no English text (fine for shipping; dev/demo locale will fall back to Korean)',
      })
  return { errors, warnings }
}

export function formatReport(r: Report): string {
  const lines: string[] = []
  if (r.errors.length) {
    lines.push(`✖ ${r.errors.length} content error(s):`)
    for (const e of r.errors) lines.push(`  ${e.file}  ${e.path ? `[${e.path}] ` : ''}${e.message}`)
  }
  if (r.warnings.length) {
    lines.push(`⚠ ${r.warnings.length} warning(s):`)
    for (const w of r.warnings)
      lines.push(`  ${w.file}  ${w.path ? `[${w.path}] ` : ''}${w.message}`)
  }
  if (!r.errors.length) lines.push('✔ content/ui.json valid')
  return lines.join('\n')
}
