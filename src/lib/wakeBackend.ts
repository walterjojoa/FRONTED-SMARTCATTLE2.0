import { dataMode } from '../api/config'
import { getJson } from '../api/httpClient'

/**
 * Knocks on the backend as soon as the app opens, so it is awake by the time
 * anyone presses a button.
 *
 * Render's free plan stops the service after a while, and the request that
 * wakes it waits up to a minute. Left alone, that minute lands on whoever
 * presses "Ingresar" first. Spending it here, while they are still reading the
 * login, usually means it is over before they finish typing.
 *
 * Deliberately quiet: the answer is not used, a failure changes nothing on
 * screen, and nothing waits for it. /health needs no session, so it runs
 * before anyone has signed in.
 */
export function wakeBackend(): void {
  if (dataMode === 'mock') return
  // token: null -- there may be no session yet, and /health does not want one.
  void getJson('/health', { token: null, timeoutMs: 60_000 }).catch(() => {})
}
