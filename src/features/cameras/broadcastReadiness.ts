/**
 * Whether this device can broadcast its camera, and what to say when it cannot.
 *
 * "Transmitir" used to be disabled whenever there was no service to send video
 * to, with nothing on screen about it: a grey button, a filled-in name, and no
 * way to find out that the problem was not the name. Each reason now has a
 * sentence, and the ones the person can act on say what to do.
 */

export type BroadcastBlock = 'in-app-browser' | 'no-camera-api' | 'no-service' | null

/**
 * Browsers embedded in another app. Their WebView often refuses getUserMedia
 * outright, or grants it and hands back a dead track, and the person has no way
 * to tell that from a broken page -- which is where most people land, because
 * they opened the link from a QR reader or from a chat.
 */
const IN_APP = [
  /FBAN|FBAV|FB_IAB/i, // Facebook and Messenger
  /Instagram/i,
  /WhatsApp/i,
  /\bLine\//i,
  /Twitter|TwitterAndroid/i,
  /TikTok|musical_ly/i,
  /MicroMessenger/i, // WeChat
  /; wv\)/i, // Android WebView announces itself
]

export function isInAppBrowser(userAgent: string): boolean {
  return IN_APP.some(pattern => pattern.test(userAgent))
}

/** Older browsers, and any page not on https, have no camera API at all. */
export function hasCameraApi(media: MediaDevices | undefined): boolean {
  return typeof media?.getUserMedia === 'function'
}

export function broadcastBlock(
  { serviceReady, userAgent, media }: { serviceReady: boolean; userAgent: string; media: MediaDevices | undefined },
): BroadcastBlock {
  // The browser comes first: no service in the world helps a page that cannot
  // open the camera, and this is the one the person can fix in two taps.
  if (isInAppBrowser(userAgent)) return 'in-app-browser'
  if (!hasCameraApi(media)) return 'no-camera-api'
  if (!serviceReady) return 'no-service'
  return null
}

export const BROADCAST_MESSAGE: Record<NonNullable<BroadcastBlock>, string> = {
  'in-app-browser': 'Abre esta página en Safari o Chrome para usar la cámara.',
  'no-camera-api': 'Abre esta página en Safari o Chrome para usar la cámara.',
  'no-service': 'Ahora mismo no hay un servicio de visión que reciba el video. Enciende el PC de la finca, o pide que se configure el servicio compartido de SmartCattle.',
}
