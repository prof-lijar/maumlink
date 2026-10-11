import { defineConfig, devices } from '@playwright/test'

// Dedicated current-flow checks. Legacy E2E snapshots target the previous emotional lessons.
export default defineConfig({
  testDir: './tests/behavior',
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  reporter: 'list',
  outputDir: '.tmp/behavior-test-results',
  use: {
    ...devices['Desktop Chrome'],
    channel: 'chrome',
    baseURL: 'http://localhost:4180',
    locale: 'ko-KR',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node node_modules/vite/bin/vite.js preview --port 4180 --strictPort',
    url: 'http://localhost:4180',
    reuseExistingServer: false,
  },
})
