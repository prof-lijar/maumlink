import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import type { SortCategory } from '@/engine/behaviorGame'

type Drag = { id: string; x: number; y: number; target: SortCategory | null }
type Gesture = { id: string; pointerId: number; x: number; y: number; active: boolean }

/** Pointer capture gives mouse, touch, and pen the same drop/cancel behavior. */
export function useSortingDrag(onDrop: (id: string, category: SortCategory) => void) {
  const baskets = useRef<Partial<Record<SortCategory, HTMLElement | null>>>({})
  const gesture = useRef<Gesture | null>(null)
  const suppressClick = useRef(false)
  const [drag, setDrag] = useState<Drag | null>(null)
  const targetAt = (x: number, y: number): SortCategory | null => {
    for (const category of ['do', 'rethink'] as const) {
      const rect = baskets.current[category]?.getBoundingClientRect()
      if (rect && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom)
        return category
    }
    return null
  }
  const cancel = useCallback(() => {
    if (gesture.current?.active) suppressClick.current = true
    gesture.current = null
    setDrag(null)
  }, [])
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') cancel()
    }
    window.addEventListener('keydown', escape)
    window.addEventListener('blur', cancel)
    return () => {
      window.removeEventListener('keydown', escape)
      window.removeEventListener('blur', cancel)
    }
  }, [cancel])

  const handlers = (id: string) => ({
    onPointerDown(event: PointerEvent<HTMLButtonElement>) {
      if (!event.isPrimary || event.button !== 0 || gesture.current) return
      suppressClick.current = false
      gesture.current = {
        id,
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        active: false,
      }
      event.currentTarget.setPointerCapture?.(event.pointerId)
    },
    onPointerMove(event: PointerEvent<HTMLButtonElement>) {
      const current = gesture.current
      if (!current || current.pointerId !== event.pointerId) return
      if (!current.active && Math.hypot(event.clientX - current.x, event.clientY - current.y) < 8)
        return
      current.active = true
      suppressClick.current = true
      // The panels sit above the cards, so a drag near an edge scrolls the page toward them.
      if (event.clientY < 90) window.scrollBy(0, -14)
      else if (event.clientY > window.innerHeight - 60) window.scrollBy(0, 14)
      setDrag({
        id: current.id,
        x: event.clientX,
        y: event.clientY,
        target: targetAt(event.clientX, event.clientY),
      })
    },
    onPointerUp(event: PointerEvent<HTMLButtonElement>) {
      const current = gesture.current
      if (!current || current.pointerId !== event.pointerId) return
      const category = current.active ? targetAt(event.clientX, event.clientY) : null
      gesture.current = null
      setDrag(null)
      if (event.currentTarget.hasPointerCapture?.(event.pointerId))
        event.currentTarget.releasePointerCapture(event.pointerId)
      if (category) onDrop(current.id, category)
    },
    onPointerCancel: cancel,
    onLostPointerCapture: cancel,
  })
  return { drag, baskets, handlers, suppressClick }
}
