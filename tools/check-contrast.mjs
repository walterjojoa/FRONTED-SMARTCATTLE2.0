/**
 * WCAG contrast for every text/background pair the light palette puts on screen.
 *
 * Glass panels are translucent white over a near-white page, so they are measured
 * as white. On a tinted surface the same colour often falls under 4.5:1, which is why
 * each state has a darker ink; this says whether those inks are dark enough instead of
 * trusting that they look fine.
 *
 *   node tools/check-contrast.mjs
 *
 * Exits non-zero when a pair fails, so it can gate a build.
 */

const c = {
  white: '#F7FAF7',
  ground: '#EDF2EE',
  well: '#E3EBE5',
  ink: '#10241F',
  inkMuted: '#2C433A',
  inkSubtle: '#4F635B',
  brand: '#0A7F5F',
  brandStrong: '#066B50',
  mint: '#E3FBF3',
  action: '#31F2BF',
  actionHover: '#15CB9A',
  onAction: '#10241F',
  lime: '#E4FF33',
  proof: '#F6FADF',
  dark: '#0B1D1B',
  darkRaised: '#132B28',
  darkCopy: '#B4C8C0',
  darkFine: '#86A097',
  footerCopy: '#9FB6AD',
  safeInk: '#066B50',
  safe: '#0A9B73',
  warning: '#D9A21B',
  warningStrong: '#A87912',
  warningInk: '#6E5009',
  warningSurface: '#FBEBD6',
  critical: '#B5502A',
  criticalInk: '#7A3416',
  criticalSurface: '#F6E4D9',
  info: '#0A86C9',
  infoInk: '#075E8F',
  infoSurface: '#E6F3FB',
  stage: '#0B1D1B',
  stageInk: '#FFFFFF',
  // The farm-status card tints, flattened over white.
  tintCritical: '#F3E8E0',
  tintWarning: '#F4EEDB',
  tintSafe: '#E3F0E8',
}

/** Normal text needs 4.5:1; large text (>=24px, or >=18.66px bold) needs 3:1. */
const AA = 4.5
const AA_LARGE = 3

const channel = value => {
  const v = value / 255
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map(at => parseInt(hex.slice(at, at + 2), 16))
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function ratio(foreground, background) {
  const [a, b] = [luminance(foreground), luminance(background)].sort((x, y) => y - x)
  return (a + 0.05) / (b + 0.05)
}

const pairs = [
  ['texto sobre el fondo', c.ink, c.ground, AA],
  ['texto sobre cristal', c.ink, c.white, AA],
  ['texto sobre superficie hundida', c.ink, c.well, AA],
  ['texto apagado sobre el fondo', c.inkMuted, c.ground, AA],
  ['texto apagado sobre superficie hundida', c.inkMuted, c.well, AA],
  ['texto tenue sobre el fondo', c.inkSubtle, c.ground, AA],
  ['texto tenue sobre cristal', c.inkSubtle, c.white, AA],
  ['texto tenue sobre superficie hundida', c.inkSubtle, c.well, AA],
  ['boton principal: tinta sobre menta', c.onAction, c.action, AA],
  ['boton principal en hover', c.onAction, c.actionHover, AA],
  ['insignia: tinta sobre lima', c.ink, c.lime, AA],
  ['marca: icono sobre menta', c.onAction, c.action, AA_LARGE],
  ['burbuja del usuario (menta)', c.onAction, c.action, AA],
  ['verde de marca sobre blanco', c.brand, c.white, AA],
  ['verde de marca sobre superficie hundida', c.brand, c.well, AA_LARGE],
  ['verde fuerte sobre su tinte', c.brandStrong, c.mint, AA],
  ['verde de enlace sobre cristal', c.brandStrong, c.white, AA],
  ['exito sobre su tinte', c.safeInk, c.mint, AA],
  ['advertencia sobre su tinte', c.warningInk, c.warningSurface, AA],
  ['critico sobre su tinte', c.criticalInk, c.criticalSurface, AA],
  ['informativo sobre su tinte', c.infoInk, c.infoSurface, AA],
  ['critico sobre cristal', c.criticalInk, c.white, AA],
  ['banner de alarma', c.white, c.criticalInk, AA],
  ['titular critico sobre su tarjeta', c.criticalInk, c.tintCritical, AA],
  ['titular de advertencia sobre su tarjeta', c.warningInk, c.tintWarning, AA],
  ['titular seguro sobre su tarjeta', c.brandStrong, c.tintSafe, AA],
  ['texto sobre el panel de prueba', c.ink, c.proof, AA],
  ['capitulo oscuro: titulos', c.white, c.dark, AA],
  ['capitulo oscuro: texto de apoyo', c.darkCopy, c.dark, AA],
  ['capitulo oscuro: enlaces menta', c.action, c.dark, AA],
  ['capitulo oscuro: nodos', c.white, c.darkRaised, AA],
  ['capitulo oscuro: letra fina', c.darkFine, c.dark, AA],
  ['pie: enlaces', c.footerCopy, c.dark, AA],
  ['texto sobre el escenario de camara', c.stageInk, c.stage, AA],
  // Strokes and detection boxes are shapes, not text: 3:1 is the bar.
  ['trazo de exito sobre el fondo', c.safe, c.ground, AA_LARGE],
  ['trazo critico sobre el fondo', c.critical, c.ground, AA_LARGE],
  ['trazo de advertencia sobre el fondo', c.warningStrong, c.ground, AA_LARGE],
  ['trazo informativo sobre el fondo', c.info, c.ground, AA_LARGE],
  ['trazo verde de marca sobre el fondo', c.brand, c.ground, AA_LARGE],
  ['detecciones menta sobre el escenario', c.action, c.stage, AA_LARGE],
  ['ambar de alerta sobre la noche', '#FFB547', c.stage, AA],
  ['tinta sobre ambar', '#2A1A00', '#FFB547', AA],
  ['riel oscuro: enlaces', c.darkCopy, c.dark, AA],
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
