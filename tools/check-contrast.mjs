/**
 * WCAG contrast for every text/background pair the palette puts on screen.
 *
 * The palette's colours were picked against white. On a tinted surface the same
 * colour often falls under 4.5:1, which is why each state has a darker ink; this
 * is what says whether those inks are actually dark enough, instead of trusting
 * that they look fine.
 *
 *   node tools/check-contrast.mjs
 *
 * Exits non-zero when a pair fails, so it can gate a build.
 */

const palette = {
  bg: '#F7F3EA',
  surface: '#FFFFFF',
  surfaceAlt: '#EFE8DA',
  border: '#E3DCCD',
  text: '#1F2A24',
  textMuted: '#5B6660',
  textInverse: '#F7F3EA',
  primary: '#1F5E3B',
  primaryHover: '#174A2E',
  primarySoft: '#DCEBDF',
  accent: '#E08A2E',
  accentHover: '#C9761F',
  accentSoft: '#FBEBD6',
  sidebar: '#14231B',
  sidebarText: '#D9E3DC',
  success: '#2E8B57',
  successInk: '#1E5C39',
  successSoft: '#DCEBDF',
  warning: '#D9A21B',
  warningInk: '#6E5009',
  warningStrong: '#A87912',
  warningSoft: '#FBEBD6',
  danger: '#C2412D',
  dangerInk: '#8E2E1F',
  dangerSoft: '#F7E2DE',
  info: '#2F6F8F',
  infoInk: '#22526A',
  infoSoft: '#DEEAF0',
}

/** Normal text needs 4.5:1; large text (>=24px, or >=18.66px bold) needs 3:1. */
const AA = 4.5
const AA_LARGE = 3

const channel = value => {
  const c = value / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map(at => parseInt(hex.slice(at, at + 2), 16))
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function ratio(foreground, background) {
  const [a, b] = [luminance(foreground), luminance(background)].sort((x, y) => y - x)
  return (a + 0.05) / (b + 0.05)
}

// Every pair the stylesheets actually produce, named the way a person would say it.
const pairs = [
  ['texto sobre el fondo', palette.text, palette.bg, AA],
  ['texto sobre tarjeta', palette.text, palette.surface, AA],
  ['texto sobre tarjeta secundaria', palette.text, palette.surfaceAlt, AA],
  ['texto apagado sobre el fondo', palette.textMuted, palette.bg, AA],
  ['texto apagado sobre tarjeta', palette.textMuted, palette.surface, AA],
  ['texto apagado sobre tarjeta secundaria', palette.textMuted, palette.surfaceAlt, AA],
  ['boton principal', palette.textInverse, palette.primary, AA],
  ['boton principal en hover', palette.textInverse, palette.primaryHover, AA],
  ['verde sobre su propio tinte', palette.primary, palette.primarySoft, AA],
  ['encabezado crema sobre verde', palette.textInverse, palette.primary, AA],
  // The rule from the brief: never white on amber, so the ink there is the dark text.
  ['texto sobre ambar', palette.text, palette.accent, AA],
  ['texto sobre tinte ambar', palette.text, palette.accentSoft, AA],
  // --color-accent-hover on --color-accent-soft measures 2.95:1, under even the
  // 3:1 for large text. That is why no amber tint carries amber ink anywhere:
  // the inks on those surfaces are --color-text. Left here as the reason.
  ['barra lateral', palette.sidebarText, palette.sidebar, AA],
  ['item activo de la barra', palette.textInverse, palette.primary, AA],
  ['exito sobre su tinte', palette.successInk, palette.successSoft, AA],
  ['advertencia sobre su tinte', palette.warningInk, palette.warningSoft, AA],
  ['peligro sobre su tinte', palette.dangerInk, palette.dangerSoft, AA],
  ['informativa sobre su tinte', palette.infoInk, palette.infoSoft, AA],
  ['exito sobre tarjeta', palette.successInk, palette.surface, AA],
  ['peligro sobre tarjeta', palette.dangerInk, palette.surface, AA],
  ['informativa sobre tarjeta', palette.infoInk, palette.surface, AA],
  // Graph strokes and detection boxes are shapes, not text: 3:1 is the bar.
  ['trazo de exito sobre el fondo', palette.success, palette.bg, AA_LARGE],
  ['trazo de peligro sobre el fondo', palette.danger, palette.bg, AA_LARGE],
  ['trazo de advertencia sobre el fondo', palette.warningStrong, palette.bg, AA_LARGE],
  ['relleno de advertencia con texto encima', palette.text, palette.warning, AA],
  ['trazo informativo sobre el fondo', palette.info, palette.bg, AA_LARGE],
  ['borde sobre el fondo', palette.border, palette.bg, 1.2],
]

let failed = 0
for (const [name, foreground, background, needs] of pairs) {
  const value = ratio(foreground, background)
  const ok = value >= needs
  if (!ok) failed += 1
  const mark = ok ? 'OK  ' : 'FALLA'
  console.log(`${mark} ${value.toFixed(2)}:1 (pide ${needs}) ${name}  ${foreground} sobre ${background}`)
}

console.log(failed === 0 ? '\nTodas las combinaciones pasan.' : `\n${failed} combinacion(es) por debajo del minimo.`)
process.exit(failed === 0 ? 0 : 1)
