#!/usr/bin/env tsx
/** CLI: `pnpm validate` — exits non-zero on any content error (PRD §10). */
import { fileURLToPath, URL } from 'node:url'
import { EPISODE_COUNT, validateBehaviorContent } from './validate-behavior-content'
import { formatReport, validateAll } from './validate-core'

const root = fileURLToPath(new URL('..', import.meta.url))
const report = validateAll(root)
console.log(formatReport(report))
const behaviorErrors = validateBehaviorContent(root)
if (behaviorErrors.length) console.error(behaviorErrors.join('\n'))
else
  console.log(
    `Behavior content: ${EPISODE_COUNT} episodes (choice + sorting, and step episodes), schema checks passed (drafts; educator review pending).`,
  )
process.exit(report.errors.length || behaviorErrors.length ? 1 : 0)
