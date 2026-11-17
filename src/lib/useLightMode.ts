import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'

/** What the browser tells us about the connection, where it tells us at all. */
interface Connection {
  saveData?: boolean
  effectiveType?: string
  addEventListener?: (type: 'change', listener: () => void) => void
  removeEventListener?: (type: 'change', listener: () => void) => void
}

const SLOW_TYPES = ['slow-2g', '2g', '3g']

function connection(): Connection | undefined {
  // Only Chromium ships this. Its absence means "no reason to hold back".
  return (navigator as Navigator & { connection?: Connection }).connection
}

function pinched(): boolean {
  const link = connection()
  if (!link) return false
  return Boolean(link.saveData) || SLOW_TYPES.includes(link.effectiveType ?? '')
}

/**
 * Whether to show the still picture instead of the animated one.
 *
 * Two different reasons land on the same answer: someone who asked the system
 * for less motion, and someone on a connection where a decorative download is
 * taken out of the data they are paying for. Neither wants the animation, so
 * neither gets it, and both still get the scene.
 */
export function useLightMode(): boolean {
  const reduce = useReducedMotion()
  const [slow, setSlow] = useState(pinched)

  useEffect(() => {
    const link = connection()
    if (!link?.addEventListener) return
    // Walking out of wifi mid-session should count, so this follows the change.
    const onChange = () => setSlow(pinched())
    link.addEventListener('change', onChange)
    return () => link.removeEventListener?.('change', onChange)
  }, [])

  return Boolean(reduce) || slow
}
