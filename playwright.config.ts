import { defineConfig, devices } from '@playwright/test'

/**
 * Browser checks for the current behaviour-centred flow (tests/behavior) run against the
 * production build (`vite preview`) in the system Chrome, so the service worker and precache
 * behave as they will for children in classrooms. Run `pnpm build` first.
 */
export default defineConfig({
  testDir: './tests/behavior',
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  outputDir: '.tmp/behavior-test-results',
  use: {
    ...devices['Desktop Chrome'],
    channel: 'chrome',
    // A fake microphone so 말로 이야기하기 can be exercised without a device or a prompt.
    launchOptions: {
      args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
    },
    permissions: ['microphone'],
    baseURL: 'http://localhost:4173',
    locale: 'ko-KR',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
  },
  webServer: {
    // A single process (no shell chain) so Playwright can always kill it; never reuse a
    // stray server — that silently tests a stale build.
    command: 'node node_modules/vite/bin/vite.js preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
