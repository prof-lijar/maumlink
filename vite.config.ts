import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig, type Plugin } from 'vite'
import { validateBehaviorContent } from './scripts/validate-behavior-content.ts'
import { formatReport, validateAll } from './scripts/validate-core.ts'
import { NARRATION_VOICES, resolveNarrationVoice } from './src/services/narration/voices.ts'

const root = fileURLToPath(new URL('.', import.meta.url))
const narrationVoice = resolveNarrationVoice(process.env.VITE_NARRATION_VOICE)
/** Inactive voice sets stay in public/ but are not precached (FR-PWA-02 covers only the shipped voice). */
const inactiveNarrationGlobs = Object.values(NARRATION_VOICES)
  .filter((voice) => voice.id !== narrationVoice.id)
  .map((voice) => `${voice.audioDir.replace(/^\//, '')}/**`)

/** FR-ENG-02: invalid content fails the build with a plain-language message. */
function contentValidation(): Plugin {
  return {
    name: 'maumlink:validate-content',
    buildStart() {
      const behaviorErrors = validateBehaviorContent(root)
      if (behaviorErrors.length) throw new Error(behaviorErrors.join('\n'))
      const report = validateAll(root)
      if (report.errors.length > 0) {
        throw new Error(`\n${formatReport(report)}`)
      }
      if (report.warnings.length > 0) {
        this.warn(formatReport(report))
      }
    },
  }
}

// https://vite.dev/config/
// `--mode native` builds the Capacitor app bundle: assets ship inside the APK, so no service worker.
export default defineConfig(({ mode }) => ({
  plugins: [
    contentValidation(),
    react(),
    tailwindcss(),
    VitePWA({
      disable: mode === 'native',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: '마음잇다',
        short_name: '마음잇다',
        description: '느린학습자를 위한 사회정서교육 앱',
        lang: 'ko',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        background_color: '#FFF9EF',
        theme_color: '#FFF9F1',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // FR-PWA-02: everything the app needs offline is precached.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2,mp3,json,webmanifest}'],
        globIgnores: [
          '**/node_modules/**',
          'sw.js',
          'workbox-*.js',
          // Earlier illustration sets stay on disk for provenance but no screen references them.
          'img/generated/**',
          'img/*.png',
          'img/*.webp',
          ...inactiveNarrationGlobs,
        ],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: 'index.html',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@content': fileURLToPath(new URL('./content', import.meta.url)),
    },
  },
  build: {
    target: 'es2020',
  },
}))
