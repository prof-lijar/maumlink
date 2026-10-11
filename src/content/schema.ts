/**
 * Shared content primitives. Zod is the single source of truth; the TypeScript types are
 * inferred from it so the validator, loader and UI never disagree. Korean (`ko`) is required
 * and shipped; `en` is optional and dev/demo only (D17). Episode content lives in
 * behaviorSchema.ts / stepSchema.ts; the emotion-centred 1.0 scenario schema was retired
 * (its reviewed sources are kept in content-source/reviewed/).
 */
import { z } from 'zod'

export const LString = z.object({
  ko: z.string().min(1),
  en: z.string().min(1).optional(),
  audio: z.object({ ko: z.string().optional(), en: z.string().optional() }).optional(),
  draft: z.boolean().optional(),
})
export type LString = z.infer<typeof LString>

export const OptionId = z.enum(['A', 'B', 'C', 'D'])
export type OptionId = z.infer<typeof OptionId>
export const Domain = z.enum(['self', 'social', 'relation', 'mind', 'reserved'])
export type Domain = z.infer<typeof Domain>

export const UiString = z.object({ ko: z.string().min(1), en: z.string().min(1).optional() })
export const UiFile = z.record(z.string(), UiString)
export type UiFile = z.infer<typeof UiFile>
