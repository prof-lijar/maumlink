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
    `Story content: ${EPISODE_COUNT} reviewed stories, schema checks passed (step arrangement awaits educator review).`,
  )
process.exit(report.errors.length || behaviorErrors.length ? 1 : 0)
