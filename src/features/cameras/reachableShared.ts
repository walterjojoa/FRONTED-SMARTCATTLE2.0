const LOOPBACK = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/i

/**
 * The backend's shared service, if this page can actually reach it. Render ships
 * SMARTCATTLE_AI_URL=http://localhost:8090 as a placeholder: from the cloud site that
 * address is the viewer's own phone, so taking it made "Transmitir" send video nowhere
 * and hid the panel that links a farm PC. A loopback address only counts on a page that
 * is itself running on this machine.
 */
export function reachableShared(shared: string | null | undefined, pageHost = globalThis.location?.hostname ?? ''): string | null {
  if (!shared) return null
  if (!LOOPBACK.test(shared)) return shared
  return LOOPBACK.test(`http://${pageHost}`) ? shared : null
}
