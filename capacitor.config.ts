import type { CapacitorConfig } from '@capacitor/cli'

// WebView remote debugging stays on for debug builds only (Capacitor default).
// The native app wraps the same React build (`pnpm build:native` → dist/).
const config: CapacitorConfig = {
  appId: 'com.maumlink.app',
  appName: '마음잇다',
  webDir: 'dist',
}

export default config
