import type { Scenario } from '@/content/schema'
import { useT } from '@/i18n/useT'

/** Keeps the concrete situation in view (a small framed picture) while a new question is asked. */
export function ScenePeek({ scenario }: { scenario: Scenario }) {
  const { L, locale } = useT()
  const source = scenario.situation.imageByLocale?.[locale] ?? scenario.situation.image
  const base = source?.replace(/\.(png|webp|jpe?g)$/i, '')
  if (!base) return null
  return (
    <img
      className="scene-peek"
      src={`${base}-800.webp`}
      width={160}
      height={100}
      alt={L(scenario.situation.imageBrief)}
    />
  )
}
