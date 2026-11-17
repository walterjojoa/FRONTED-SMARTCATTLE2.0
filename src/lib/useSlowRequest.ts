import { useEffect, useState } from 'react'

/** Past this, a request is no longer "a moment" and silence starts to look like a fault. */
export const SLOW_AFTER_MS = 5000

export const WAKING_NOTE = 'El servidor está despertando, puede tardar hasta un minuto.'

/**
 * Whether the request now running has gone on long enough to explain itself.
 *
 * The backend sleeps on Render's free plan and takes up to a minute to answer
 * the first request. A spinner that long reads as broken, and people press the
 * button again or leave. Saying what is happening costs nothing and buys the
 * whole minute.
 *
 * False again as soon as the request ends, so a fast one never shows the note.
 */
export function useSlowRequest(active: boolean, afterMs: number = SLOW_AFTER_MS): boolean {
  const [elapsed, setElapsed] = useState(false)

  useEffect(() => {
    if (!active) return
    const timer = setTimeout(() => setElapsed(true), afterMs)
    // Cleared on the way out, so the next request starts its own count instead
    // of inheriting this one's and showing the note straight away.
    return () => {
      clearTimeout(timer)
      setElapsed(false)
    }
  }, [active, afterMs])

  // Read as a pair rather than reset in the effect body: nothing is slow while
  // nothing is running, and that needs no extra render to say so.
  return active && elapsed
}
