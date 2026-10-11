import { useEffect, useState } from 'react'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { speech } from '@/services/speech'
import { Outlet } from 'react-router'
import { useSettings } from '@/services/settings'

/** Applies persisted settings to <html> (text size, lang) and hosts the routes. */
export function AppShell() {
  const [announcement, setAnnouncement] = useState('')
  useEffect(() => speech.onText(setAnnouncement), [])
  // Android hardware back walks the in-app history before leaving the app.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    const listener = App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) window.history.back()
      else void App.exitApp()
    })
    return () => void listener.then((handle) => handle.remove())
  }, [])
  const textSize = useSettings((s) => s.textSize)
  const locale = useSettings((s) => s.locale)

  useEffect(() => {
    const html = document.documentElement
    html.dataset.text = textSize
    html.lang = locale
  }, [textSize, locale])

  return (
    <>
      <Outlet />
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
    </>
  )
}
