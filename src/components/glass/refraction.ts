/*
 * Liquid-glass refraction: a Snell's-law displacement map rendered to a PNG and used by an SVG
 * filter as `backdrop-filter`. Adapted from the "Liquid Glass" component by manuarora700 on 21st.dev.
 *
 * Map channels: R = horizontal bend, G = vertical bend, B = rim specular, A = shape mask.
 * Neutral grey (128) means zero displacement.
 */

export interface MapOptions {
  width: number
  height: number
  radius: number
  bevelDepth: number
  gain?: number
  dpr?: number
}

export interface FilterOptions {
  id: string
  mapUrl: string
  width: number
  height: number
  scale: number
  aberration: number
  frost: number
}

/** Signed distance to a rounded box centred at the origin; negative inside. */
function sdRoundedBox(px: number, py: number, halfW: number, halfH: number, r: number) {
  const qx = Math.abs(px) - halfW + r
  const qy = Math.abs(py) - halfH + r
  return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - r
}

/** Squircle-dome slope to Snell's-law bend. `x` is 0 at the rim and 1 at the centre. */
function bendFromDepth(x: number) {
  const u = 1 - Math.min(1, Math.max(0, x))
  const denom = (1 - u ** 4) ** 0.75
  if (denom < 1e-6) return 0
  const thetaI = Math.atan(Math.min(u ** 3 / denom, 8))
  const sinT = Math.sin(thetaI) / 1.5
  if (sinT >= 1) return Math.sin(thetaI)
  return Math.sin(thetaI - Math.asin(sinT))
}

function buildPhiTable(bevelPx: number) {
  const n = Math.max(1, Math.ceil(bevelPx))
  const phi = new Float32Array(n + 1)
  for (let d = 1; d <= n; d++) phi[d] = phi[d - 1] + bendFromDepth(d / n)
  return phi
}

function samplePhi(phi: Float32Array, depth: number) {
  const max = phi.length - 1
  if (depth <= 0) return phi[0]
  if (depth >= max) return phi[max]
  const i = Math.floor(depth)
  const f = depth - i
  return phi[i] * (1 - f) + phi[i + 1] * f
}

function computeMap(opts: MapOptions) {
  const dpr = opts.dpr ?? 1
  const gain = opts.gain ?? 1.35
  const lightLen = Math.hypot(-0.55, -0.85)
  const lx = -0.55 / lightLen
  const ly = -0.85 / lightLen

  const W = Math.max(1, Math.round(opts.width * dpr))
  const H = Math.max(1, Math.round(opts.height * dpr))
  const halfW = W / 2
  const halfH = H / 2
  const r = Math.min(opts.radius * dpr, halfW, halfH)
  const bevel = Math.max(1, opts.bevelDepth * dpr)
  const phi = buildPhiTable(bevel)

  const field = new Float32Array(W * H)
  for (let y = 0; y < H; y++) {
    const py = y - halfH + 0.5
    for (let x = 0; x < W; x++) {
      const d = sdRoundedBox(x - halfW + 0.5, py, halfW, halfH, r)
      field[y * W + x] = d > 0 ? 0 : samplePhi(phi, Math.min(bevel, -d))
    }
  }

  const data = new Uint8ClampedArray(W * H * 4)
  for (let y = 0; y < H; y++) {
    const py = y - halfH + 0.5
    for (let x = 0; x < W; x++) {
      const px = x - halfW + 0.5
      const i = (y * W + x) << 2
      const d = sdRoundedBox(px, py, halfW, halfH, r)
      if (d > 0) {
        data[i] = data[i + 1] = data[i + 2] = 128
        data[i + 3] = 0
        continue
      }
      const x0 = Math.max(0, x - 1)
      const x1 = Math.min(W - 1, x + 1)
      const y0 = Math.max(0, y - 1)
      const y1 = Math.min(H - 1, y + 1)
      const dx = Math.max(-1, Math.min(1, ((field[y * W + x1] - field[y * W + x0]) / (x1 - x0 || 1)) * gain))
      const dy = Math.max(-1, Math.min(1, ((field[y1 * W + x] - field[y0 * W + x]) / (y1 - y0 || 1)) * gain))

      let specular = 0
      if (d >= -bevel) {
        const gx = sdRoundedBox(px + 1, py, halfW, halfH, r) - sdRoundedBox(px - 1, py, halfW, halfH, r)
        const gy = sdRoundedBox(px, py + 1, halfW, halfH, r) - sdRoundedBox(px, py - 1, halfW, halfH, r)
        const len = Math.hypot(gx, gy) || 1
        const dot = (gx / len) * lx + (gy / len) * ly
        const rim = 1 - Math.min(1, -d / bevel)
        specular = (Math.max(0, dot) + Math.max(0, -dot) * 0.35) * rim
      }
      data[i] = 128 + dx * 127
      data[i + 1] = 128 + dy * 127
      data[i + 2] = Math.round(specular * 255)
      data[i + 3] = 255
    }
  }
  return { data, width: W, height: H }
}

/** PNG blob URL for feImage (WebKit rejects data: URIs inside feImage). */
export async function generateDisplacementUrl(opts: MapOptions) {
  const { data, width, height } = computeMap(opts)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2d context unavailable')
  ctx.putImageData(new ImageData(data, width, height), 0, 0)
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
  if (!blob) throw new Error('Failed to encode displacement map')
  return URL.createObjectURL(blob)
}

export function buildFilterSvg({ id, mapUrl, width, height, scale, aberration, frost }: FilterOptions) {
  const pad = Math.ceil(scale + aberration + 4)
  const px = (pad / Math.max(1, width)) * 100
  const py = (pad / Math.max(1, height)) * 100
  const region = `x="-${px.toFixed(3)}%" y="-${py.toFixed(3)}%" width="${(100 + 2 * px).toFixed(3)}%" height="${(100 + 2 * py).toFixed(3)}%"`
  const map = `<feImage href="${mapUrl}" xlink:href="${mapUrl}" x="0" y="0" width="${width}" height="${height}" result="map" preserveAspectRatio="none"/>`
  const displace = (s: number, result: string) =>
    `<feDisplacementMap in="SourceGraphic" in2="map" scale="${s}" xChannelSelector="R" yChannelSelector="G" result="${result}"/>`

  const body = aberration <= 0
    ? displace(scale, 'rgb')
    : `${displace(scale + aberration, 'dispR')}
  <feColorMatrix in="dispR" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red"/>
  ${displace(scale, 'dispG')}
  <feColorMatrix in="dispG" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green"/>
  ${displace(Math.max(0, scale - aberration), 'dispB')}
  <feColorMatrix in="dispB" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue"/>
  <feBlend in="red" in2="green" mode="screen" result="rg"/>
  <feBlend in="rg" in2="blue" mode="screen" result="rgb"/>`

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="0" height="0" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden"><filter id="${id}" color-interpolation-filters="sRGB" ${region}>
  ${map}
  ${body}
  <feGaussianBlur in="rgb" stdDeviation="${frost}"/>
</filter></svg>`
}

export function supportsRefraction() {
  if (typeof CSS === 'undefined' || !CSS.supports) return false
  const ua = navigator.userAgent
  const safariLike = /Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR/.test(ua)
  const reduced = window.matchMedia?.('(prefers-reduced-transparency: reduce)').matches
  return !safariLike && !reduced && (CSS.supports('backdrop-filter', 'url(#x)') || CSS.supports('-webkit-backdrop-filter', 'url(#x)'))
}
