/** UI-string validator: fixtures are built in a temp dir so tests never touch real content. */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { validateAll } from '../../scripts/validate-core'
import { validUi } from '../fixtures/content'

let root: string

function write(rel: string, data: unknown) {
  const p = join(root, rel)
  mkdirSync(join(p, '..'), { recursive: true })
  writeFileSync(p, typeof data === 'string' ? data : JSON.stringify(data))
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'maumlink-'))
})
afterEach(() => rmSync(root, { recursive: true, force: true }))

describe('validator — ui.json', () => {
  it('accepts valid strings with no errors', () => {
    write('content/ui.json', validUi)
    expect(validateAll(root).errors).toEqual([])
  })
  it('reports a missing file', () => {
    expect(validateAll(root).errors.some((e) => e.message === 'file is missing')).toBe(true)
  })
  it('rejects empty Korean text and missing ko', () => {
    write('content/ui.json', { ...validUi, 'x.empty': { ko: '' }, 'x.none': { en: 'only' } })
    const r = validateAll(root)
    expect(r.errors.some((e) => e.path === 'x.empty.ko')).toBe(true)
    expect(r.errors.some((e) => e.path === 'x.none.ko')).toBe(true)
  })
  it('warns (does not fail) when English is missing', () => {
    write('content/ui.json', { ...validUi, 'x.ko': { ko: '한국어만' } })
    const r = validateAll(root)
    expect(r.errors).toEqual([])
    expect(r.warnings.some((w) => w.path === 'x.ko')).toBe(true)
  })
  it('rejects invalid JSON', () => {
    write('content/ui.json', '{broken')
    expect(validateAll(root).errors[0]?.message).toMatch(/invalid JSON/)
  })
})
