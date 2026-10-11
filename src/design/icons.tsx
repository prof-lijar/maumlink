/** UI icons — PRD §6.6: rounded line set, 2.5 px strokes, currentColor. */
import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }

function Base({ size = 28, children, ...rest }: P) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const HomeIcon = (p: P) => (
  <Base {...p}>
    <path d="M4 11l8-7 8 7" />
    <path d="M6 10v9a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-9" />
  </Base>
)
export const SpeakerIcon = (p: P) => (
  <Base {...p}>
    <path d="M4 10v4h3l5 4V6L7 10z" />
    <path d="M16 9.5a4 4 0 0 1 0 5" />
  </Base>
)
export const SpeakerReadyIcon = (p: P) => (
  <Base {...p}>
    <path d="M4 10v4h3l5 4V6L7 10z" />
  </Base>
)
export const SpeakerMutedIcon = (p: P) => (
  <Base {...p}>
    <path d="M4 10v4h3l5 4V6L7 10z" />
    <path d="M16 8l5 8" />
  </Base>
)
export const SettingsIcon = (p: P) => (
  <Base {...p}>
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="17" r="2" />
  </Base>
)
export const ArrowLeftIcon = (p: P) => (
  <Base {...p}>
    <path d="M19 12H5" />
    <path d="M11 6l-6 6 6 6" />
  </Base>
)
export const ArrowRightIcon = (p: P) => (
  <Base {...p}>
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </Base>
)
export const HelpIcon = (p: P) => (
  <Base {...p}>
    <path d="M4 5h16v11H11l-5 4v-4H4z" />
    <path d="M10 9.5q0-2 2-2t2 1.6q-.5 1-2 1.4v1" />
    <circle cx="12" cy="13.5" r=".9" fill="currentColor" stroke="none" />
  </Base>
)
export const ReplayIcon = (p: P) => (
  <Base {...p}>
    <path d="M4 12a8 8 0 1 0 3-6.2" />
    <path d="M4 4v5h5" />
  </Base>
)
export const CheckIcon = (p: P) => (
  <Base {...p}>
    <path d="M5 12l5 5L19 7" />
  </Base>
)
export const CloseIcon = (p: P) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Base>
)
export const ChevronRightIcon = (p: P) => (
  <Base {...p}>
    <path d="M9 6l6 6-6 6" />
  </Base>
)
export const TextSizeIcon = (p: P) => (
  <Base {...p}>
    <path d="M4 18l4-12 4 12M5.5 14h5" />
    <path d="M14 18l3-8 3 8M15 15.5h4" />
  </Base>
)

export const SceneIcon = (p: P) => (
  <Base {...p}>
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <circle cx="8" cy="9" r="1.5" />
    <path d="M4 17l5-4 4 3 3-5 5 6" />
  </Base>
)
export const FeelingIcon = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 9h.1M16 9h.1M8 14q4 5 8 0" />
  </Base>
)

/** The shared vector master keeps in-app, favicon and installed identities consistent. */
export function LinkMark({ size = 40, ...rest }: P) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <image href="/brand/symbol.svg" width="120" height="120" />
    </svg>
  )
}

export const StarIcon = (p: P) => (
  <Base {...p} fill="currentColor" strokeWidth={1.5}>
    <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z" />
  </Base>
)
export const BulbIcon = (p: P) => (
  <Base {...p}>
    <path d="M9 18h6M10 21h4" />
    <path d="M8.5 14.5A6 6 0 1 1 15.5 14.5c-.8.7-1.2 1.6-1.2 2.5h-4.6c0-.9-.4-1.8-1.2-2.5z" />
  </Base>
)
export const SparkleIcon = (p: P) => (
  <Base {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.5 6.5l2 2M15.5 15.5l2 2M6.5 17.5l2-2M15.5 8.5l2-2" />
  </Base>
)
/** Filled speaker from the life-garden handoff (orange on tinted circles). */
export function GardenSpeakerIcon({
  size = 17,
  color = 'currentColor',
}: {
  size?: number
  color?: string
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 9h4l5-4v14l-5-4H4z" fill={color} />
      <path
        d="M16 8.5a5 5 0 0 1 0 7"
        stroke={color}
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}
