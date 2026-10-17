import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const inventory = JSON.parse(readFileSync('content-source/narration/inventory.json', 'utf8')) as {
  clips: Array<{ text: string }>
}
const gameCopy = JSON.parse(readFileSync('content/game-copy.json', 'utf8')) as {
  completionCheer: string
}
const recording = JSON.parse(readFileSync('src/services/narration/lulu-lolipop.json', 'utf8')) as {
  clips: Array<{ text: string; url: string }>
}
// Earlier clips can omit a final full stop; narration treats punctuation as equivalent.
const key = (text: string) =>
  text.normalize('NFC').replace(/\p{P}/gu, '').replace(/\s+/g, ' ').trim()

test('every current narration clip decodes offline and the new cheer plays', async ({
  page,
  context,
}) => {
  test.setTimeout(120_000)
  await page.goto('/')
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
    if (!navigator.serviceWorker.controller)
      await new Promise<void>((resolve) =>
        navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), {
          once: true,
        }),
      )
  })
  const urls = [
    ...new Set(
      inventory.clips.map((phrase) => {
        const clip = recording.clips.find((entry) => key(entry.text) === key(phrase.text))
        expect(clip, phrase.text).toBeDefined()
        return clip!.url
      }),
    ),
  ]
  const cheer = recording.clips.find((clip) => clip.text === gameCopy.completionCheer)
  expect(cheer).toBeDefined()
  await context.setOffline(true)
  const failed = await page.evaluate(async (paths) => {
    const decoder = new AudioContext()
    const failures: string[] = []
    try {
      for (const path of paths) {
        try {
          const response = await fetch(path)
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          const buffer = await decoder.decodeAudioData(await response.arrayBuffer())
          if (buffer.duration <= 0) throw new Error('Empty audio')
        } catch (error) {
          failures.push(`${path}: ${String(error)}`)
        }
      }
    } finally {
      await decoder.close()
    }
    return failures
  }, urls)
  expect(failed).toEqual([])
  // User activation permits real HTML audio playback, not a mocked speech implementation.
  await page.getByRole('button').first().click()
  const played = await page.evaluate(async (url) => {
    const audio = new Audio(url)
    audio.playbackRate = 2
    return new Promise<boolean>((resolve, reject) => {
      const timeout = setTimeout(() => {
        audio.pause()
        reject(new Error('Narration did not finish'))
      }, 20_000)
      audio.onended = () => {
        clearTimeout(timeout)
        resolve(audio.currentTime > 0)
      }
      audio.onerror = () => {
        clearTimeout(timeout)
        reject(new Error('Narration failed to play'))
      }
      void audio.play().catch((error: unknown) => {
        clearTimeout(timeout)
        reject(error)
      })
    })
  }, cheer!.url)
  expect(played).toBe(true)
})
