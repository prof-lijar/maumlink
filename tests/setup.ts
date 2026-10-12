import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { conversationTiming } from '@/screens/missions/conversationTiming'

// Friend replies appear at once in unit tests (the app waits ~1.5 s with a typing bubble).
conversationTiming.replyDelayMs = 0

// jsdom does not implement media playback; behave like a browser that accepts play().
// (Server-side tests run in the node environment and have no DOM at all.)
const dom = typeof HTMLMediaElement !== 'undefined'
if (dom)
  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    configurable: true,
    writable: true,
    value: vi.fn().mockResolvedValue(undefined),
  })
if (dom)
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    writable: true,
    value: vi.fn(),
  })
if (dom)
  Object.defineProperty(HTMLMediaElement.prototype, 'load', {
    configurable: true,
    writable: true,
    value: vi.fn(),
  })
// jsdom has no layout; screens reset scroll on step changes.
if (dom)
  Object.defineProperty(window, 'scrollTo', { configurable: true, writable: true, value: vi.fn() })

afterEach(() => {
  cleanup()
  if (!dom) return
  window.localStorage.clear()
  window.sessionStorage.clear()
})
