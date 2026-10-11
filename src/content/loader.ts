/** UI strings loader — validates content/ui.json in dev and exposes the typed table. */
import uiRaw from '@content/ui.json'
import { UiFile } from './schema'

const parsed = UiFile.safeParse(uiRaw)
if (!parsed.success) {
  // In production the build-time validator has already guaranteed validity.
  if (import.meta.env.DEV) console.error('[content] ui.json failed validation', parsed.error)
  throw new Error('Invalid content: ui.json')
}
export const ui: UiFile = parsed.data
