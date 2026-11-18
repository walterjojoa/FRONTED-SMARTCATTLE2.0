import { useRef, useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import { ease } from '../../../motion'
import styles from '../LandingPage.module.css'

/*
 * A living top-down map of an illustrative farm, drawn in SVG: contour lines, the safe-zone boundary,
 * two cameras sweeping their field of view and the herd as points. The scroll walks through the four
 * beats of the product (camera, detection, alert, the day) on one pinned stage.
 */

const STEPS = [
  { key: 'camara', label: '01 · Cámara', title: 'Conecta lo que ya tienes.', text: 'Una cámara IP, o la de un celular. Un nombre, un enlace y listo: sin instalar nada en el ganado.' },
  { key: 'deteccion', label: '02 · Detección', title: 'La IA cuenta. Cada animal.', text: 'SmartCattle detecta al ganado en la imagen, en vivo, y deja cada hallazgo con su cámara y su hora.' },
  { key: 'alerta', label: '03 · Alerta', title: 'Se salió: te enteras.', text: 'Dibujas la zona segura una vez. Si un animal la deja o aparece una persona donde no debe, salta la alerta.' },
  { key: 'dia', label: '04 · Tu día', title: 'Tu día, ya resumido.', text: 'Tiempo observado, máximo de animales a la vista y alertas del día. No es un diagnóstico veterinario.' },
] as const

// ---------- Geometry, computed once ----------

type Point = readonly [number, number]

/** Closed Catmull-Rom curve through the points, written as cubic Béziers. */
function smoothClosed(points: Point[]) {
  const n = points.length
  let d = `M${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n], p1 = points[i], p2 = points[(i + 1) % n], p3 = points[(i + 2) % n]
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return `${d} Z`
}

/** One contour ring: an ellipse with a little terrain noise. */
function ring(cx: number, cy: number, r: number, seed: number) {
  const points: Point[] = []
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2
    const rr = r * (1 + 0.1 * Math.sin(3 * a + seed) + 0.06 * Math.sin(5 * a + seed * 2.3))
    points.push([cx + rr * Math.cos(a) * 1.35, cy + rr * Math.sin(a) * 0.82])
  }
  return smoothClosed(points)
}

const CONTOURS = [
  ...[34, 68, 102, 136, 170].map((r, i) => ({ d: ring(440, 150, r, 0.8 + i * 0.35), key: `a${r}` })),
  ...[30, 60, 90].map((r, i) => ({ d: ring(130, 360, r, 2.1 + i * 0.4), key: `b${r}` })),
]

const RIVER = 'M-10 410 C 90 380, 150 420, 250 398 S 420 360, 470 410 S 600 440, 660 420'
const LOT = '110,96 470,64 528,300 96,336'

const CAMERAS = [
  { id: 'A', x: 62, y: 104, heading: 22 },
  { id: 'B', x: 592, y: 236, heading: 192 },
]

function cone(x: number, y: number, heading: number, spread = 26, length = 250) {
  const rad = (deg: number) => (deg * Math.PI) / 180
  const a = rad(heading - spread), b = rad(heading + spread)
  const p = (t: number) => `${(x + length * Math.cos(t)).toFixed(1)} ${(y + length * Math.sin(t)).toFixed(1)}`
  return `M${x} ${y} L${p(a)} A${length} ${length} 0 0 1 ${p(b)} Z`
}

const HERD = [
  { x: 182, y: 158, dx: 9, dy: 5, t: 7.5 },
  { x: 244, y: 214, dx: -7, dy: 8, t: 9 },
  { x: 302, y: 146, dx: 8, dy: -6, t: 8.2 },
  { x: 352, y: 238, dx: -9, dy: -5, t: 10 },
  { x: 214, y: 282, dx: 6, dy: -7, t: 8.8 },
  { x: 392, y: 168, dx: -6, dy: 7, t: 7 },
  { x: 284, y: 290, dx: 8, dy: 4, t: 9.6 },
]
const RUNNER = { x: 448, y: 248, toX: 578, toY: 318 }
const BRACKET = 'M-11 -5 V-11 H-5 M5 -11 H11 V-5 M11 5 V11 H5 M-5 11 H-11 V5'

// ---------- Pieces ----------

function Animal({ x, y, dx, dy, t, index, step, still }: { x: number; y: number; dx: number; dy: number; t: number; index: number; step: number; still: boolean }) {
  const seen = step >= 1
  return (
    <g transform={`translate(${x} ${y})`}>
      <motion.g animate={still ? undefined : { x: [0, dx, 0], y: [0, dy, 0] }}
        transition={{ duration: t, repeat: Infinity, ease: 'easeInOut', delay: index * 0.3 }}>
        <circle r="5" className={styles.animal} data-seen={seen || undefined} />
        <motion.g initial={false} animate={{ opacity: seen ? 1 : 0, scale: seen ? 1 : 1.6 }}
          transition={{ duration: 0.5, delay: seen ? 0.06 * index : 0, ease: ease.out }}>
          <path d={BRACKET} className={styles.bracket} />
          <text x="14" y="-9" className={styles.animalTag}>#{index + 1}</text>
        </motion.g>
      </motion.g>
    </g>
  )
}

function Runner({ step, still }: { step: number; still: boolean }) {
  const out = step >= 2
  const seen = step >= 1
  return (
    <g transform={`translate(${RUNNER.x} ${RUNNER.y})`}>
      <motion.g initial={false} animate={{ x: out ? RUNNER.toX - RUNNER.x : 0, y: out ? RUNNER.toY - RUNNER.y : 0 }}
        transition={still ? { duration: 0 } : { duration: 1.6, ease: ease.fluid }}>
        {out && !still && [0, 0.6, 1.2].map(delay => <circle key={delay} r="6" className={styles.ping} style={{ animationDelay: `${delay}s` }} />)}
        <circle r="5.5" className={styles.animal} data-seen={seen || undefined} data-out={out || undefined} />
        <motion.g initial={false} animate={{ opacity: seen ? 1 : 0, scale: seen ? 1 : 1.6 }} transition={{ duration: 0.5, ease: ease.out }}>
          <path d={BRACKET} className={styles.bracket} data-out={out || undefined} />
          <text x={out ? -14 : 14} y={out ? 24 : -9} textAnchor={out ? 'end' : 'start'} className={styles.animalTag} data-out={out || undefined}>{out ? '#8 · fuera de zona' : '#8'}</text>
        </motion.g>
      </motion.g>
    </g>
  )
}

function MapCard({ step, still }: { step: number; still: boolean }) {
  const draw = still
    ? {}
    : { initial: { pathLength: 0, opacity: 0 }, whileInView: { pathLength: 1, opacity: 1 }, viewport: { once: true, amount: 0.3 } }
  return (
    <div className={styles.mapCard}>
      <svg className={styles.mapSvg} viewBox="0 0 640 440" aria-hidden="true" focusable="false" data-alert={step >= 2 || undefined}>
        <defs>
          <pattern id="map-dots" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="8" cy="8" r="0.9" fill="rgb(214 255 236 / 0.12)" />
          </pattern>
          <radialGradient id="map-cone">
            <stop offset="0" stopColor="var(--color-action)" stopOpacity="0.38" />
            <stop offset="1" stopColor="var(--color-action)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="640" height="440" fill="url(#map-dots)" />
        {CONTOURS.map((c, i) => (
          <motion.path key={c.key} d={c.d} className={styles.contour} {...draw}
            transition={{ duration: 2.2, delay: i * 0.12, ease: ease.out }} />
        ))}
        <motion.path d={RIVER} className={styles.river} {...draw} transition={{ duration: 2.6, ease: ease.out }} />
        <text x="476" y="152" className={styles.contourTag}>cota 320</text>
        <text x="96" y="392" className={styles.contourTag}>cota 280</text>

        <polygon points={LOT} className={styles.lot} />
        <polygon points={LOT} className={styles.lotEdge} />
        <text x="122" y="86" className={styles.lotTag}>Lote norte · zona segura</text>

        {CAMERAS.map(cam => (
          <g key={cam.id}>
            <g className={still ? undefined : styles.sweep} style={{ transformOrigin: `${cam.x}px ${cam.y}px`, animationDelay: cam.id === 'B' ? '-3s' : undefined }}>
              <path d={cone(cam.x, cam.y, cam.heading)} fill="url(#map-cone)" />
            </g>
            <circle cx={cam.x} cy={cam.y} r="14" className={styles.camHalo} />
            <rect x={cam.x - 7} y={cam.y - 7} width="14" height="14" rx="4" className={styles.cam} />
            <text x={cam.x + (cam.id === 'B' ? -62 : -22)} y={cam.y + (cam.id === 'B' ? -18 : 30)} className={styles.camTag}>Cámara {cam.id}</text>
          </g>
        ))}

        {HERD.map((animal, index) => <Animal key={index} {...animal} index={index} step={step} still={still} />)}
        <Runner step={step} still={still} />
      </svg>

      <p className={styles.mapTag}><span className={styles.liveDot} />Finca demo · mapa ilustrativo</p>
      <p className={styles.mapCount}>{step >= 1 ? '8 animales a la vista' : '2 cámaras en línea'}</p>

      <div className={styles.mapAlert} data-on={step === 2 || undefined} role="presentation">
        <span className={styles.alertChip}>Alerta</span>
        <span>1 animal fuera del lindero · Cámara B · 11:41</span>
      </div>

      <div className={styles.dayPanel} data-on={step >= 3 || undefined}>
        <div className={styles.dayTrack}>
          <span className={styles.dayFill} />
          <span className={styles.dayEvent} style={{ left: `${(11 + 41 / 60) / 24 * 100}%` }} />
          {['00', '06', '12', '18', '24'].map((h, i) => <span key={h} className={styles.dayTick} style={{ left: `${i * 25}%` }}>{h}</span>)}
        </div>
        <ul className={styles.daySummary}>
          <li><strong>9 h</strong> observadas</li>
          <li><strong>8</strong> máx. a la vista</li>
          <li><strong>1</strong> alerta</li>
        </ul>
        <p className={styles.dayNote}>Ejemplo con datos ficticios</p>
      </div>
    </div>
  )
}

/** Pinned stage: the copy and the living map advance together while the page scrolls. */
export function FarmMap() {
  const reduce = useReducedMotion() === true
  const track = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const { scrollYProgress } = useScroll({ target: track, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', value => setActive(Math.min(STEPS.length - 1, Math.max(0, Math.floor(value * STEPS.length)))))

  if (reduce) {
    return (
      <section id="como-funciona" className={styles.mapStatic} aria-labelledby="story-title">
        <div className={styles.rail}>
          <h2 id="story-title" className={`${styles.pairTitle} ${styles.pairDark}`}>
            <span className={styles.pairLead}>Cómo funciona.</span>{' '}
            <span className={styles.pairCont}>De la cámara al resumen del día.</span>
          </h2>
          <ol className={styles.mapList}>
            {STEPS.map(step => <li key={step.key}><p className={styles.stepLabel}>{step.label}</p><h3 className={styles.stepTitle}>{step.title}</h3><p className={styles.stepText}>{step.text}</p></li>)}
          </ol>
          <MapCard step={3} still />
        </div>
      </section>
    )
  }

  return (
    <section id="como-funciona" ref={track} className={styles.mapTrack} aria-labelledby="story-title">
      <h2 id="story-title" className="visually-hidden">Cómo funciona</h2>
      <div className={styles.mapStage}>
        <div className={styles.storyCopy}>
          <ol className={styles.progress} aria-hidden="true">
            {STEPS.map((step, index) => <li key={step.key} data-on={index <= active || undefined}><span /></li>)}
          </ol>
          <div className={styles.stepStack}>
            {STEPS.map((step, index) => (
              <motion.article key={step.key} className={styles.step} aria-hidden={index !== active}
                initial={false}
                animate={{ opacity: index === active ? 1 : 0, y: index === active ? 0 : index < active ? -28 : 28, filter: index === active ? 'blur(0px)' : 'blur(8px)' }}
                transition={{ duration: 0.55, ease: ease.out }}>
                <p className={styles.stepLabel}>{step.label}</p>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepText}>{step.text}</p>
              </motion.article>
            ))}
          </div>
        </div>
        <MapCard step={active} still={false} />
      </div>
    </section>
  )
}
