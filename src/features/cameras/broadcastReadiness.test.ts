import { describe, expect, it } from 'vitest'
import { BROADCAST_MESSAGE, broadcastBlock, hasCameraApi, isInAppBrowser } from './broadcastReadiness'

const CHROME_ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Mobile Safari/537.36'
const SAFARI_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
const camara = { getUserMedia: () => Promise.resolve({} as MediaStream) } as unknown as MediaDevices

describe('isInAppBrowser', () => {
  it('reconoce los navegadores metidos dentro de otra app', () => {
    for (const ua of [
      `${SAFARI_IOS} [FBAN/FBIOS;FBAV/450.0]`,
      `${SAFARI_IOS} Instagram 300.0`,
      `${CHROME_ANDROID} WhatsApp/2.24`,
      'Mozilla/5.0 (Linux; Android 14; wv) AppleWebKit/537.36 Chrome/130 Mobile',
    ]) expect(isInAppBrowser(ua)).toBe(true)
  })

  it('deja pasar a Safari y a Chrome de verdad', () => {
    expect(isInAppBrowser(SAFARI_IOS)).toBe(false)
    expect(isInAppBrowser(CHROME_ANDROID)).toBe(false)
  })
})

describe('hasCameraApi', () => {
  it('distingue un navegador sin API de cámara', () => {
    expect(hasCameraApi(camara)).toBe(true)
    expect(hasCameraApi(undefined)).toBe(false)
    expect(hasCameraApi({} as MediaDevices)).toBe(false)
  })
})

describe('broadcastBlock', () => {
  const base = { serviceReady: true, userAgent: CHROME_ANDROID, media: camara }

  it('no bloquea cuando todo está en su sitio', () => {
    expect(broadcastBlock(base)).toBeNull()
  })

  it('nombra la falta de servicio en vez de dejar el botón gris', () => {
    // El fallo original: sin servicio, el botón quedaba desactivado sin decir nada.
    expect(broadcastBlock({ ...base, serviceReady: false })).toBe('no-service')
    expect(BROADCAST_MESSAGE['no-service']).toMatch(/servicio de visión/)
  })

  it('antepone el navegador, que es lo que la persona puede resolver', () => {
    const dentroDeUnaApp = { ...base, serviceReady: false, userAgent: `${SAFARI_IOS} [FBAN/FBIOS]` }
    expect(broadcastBlock(dentroDeUnaApp)).toBe('in-app-browser')
    expect(BROADCAST_MESSAGE['in-app-browser']).toBe('Abre esta página en Safari o Chrome para usar la cámara.')
  })

  it('trata un navegador sin API de cámara como el mismo problema', () => {
    expect(broadcastBlock({ ...base, media: undefined })).toBe('no-camera-api')
  })
})
