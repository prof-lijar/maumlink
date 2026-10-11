import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { conversationTiming } from '@/screens/missions/ConversationMission'

// Friend replies appear at once in unit tests (the app waits ~1.5 s with a typing bubble).
conversationTiming.replyDelayMs = 0

// jsdom does not implement media playback; behave like a browser that accepts play().
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  configurable: true,
  writable: true,
  value: vi.fn().mockResolvedValue(undefined),
})
Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  writable: true,
  value: vi.fn(),
})
Object.defineProperty(HTMLMediaElement.prototype, 'load', {
  configurable: true,
  writable: true,
  value: vi.fn(),
})
// jsdom has no layout; screens reset scroll on step changes.
Object.defineProperty(window, 'scrollTo', { configurable: true, writable: true, value: vi.fn() })

afterEach(() => {
  cleanup()
  window.localStorage.clear()
  window.sessionStorage.clear()
})
