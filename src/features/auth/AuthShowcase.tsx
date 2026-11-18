import { useEffect, useState } from 'react'
import { BellRing, ChartNoAxesColumnIncreasing, ScanEye } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { BrandMark } from '../../components/ui/BrandMark'
import { ease } from '../../motion'
import styles from './AuthShowcase.module.css'

const features = [
  { icon: ScanEye, label: 'Detección con visión artificial' },
  { icon: BellRing, label: 'Zonas seguras y alertas al instante' },
  { icon: ChartNoAxesColumnIncreasing, label: 'Métricas en tiempo real' },
]

const zone = '70,250 430,222 470,334 60,348'
// Resting animals, as boxes on the camera schematic: x, y, width, height, track id.
const herd = [
  { x: 112, y: 262, w: 58, h: 38, id: 1 },
  { x: 214, y: 252, w: 62, h: 42, id: 2 },
  { x: 316, y: 262, w: 56, h: 38, id: 3 },
]
/** The animal that walks out: inside the lindero, then past it. */
const walker = { inside: { x: 392, y: 276 }, outside: { x: 506, y: 190 } }

const PHASE_MS = 2300

/**
 * The login's left panel. No photograph: a dark technical stage with a folded ribbon behind a
 * schematic camera that draws its safe zone, tracks the herd and raises one alert on a loop.
 */
export function AuthShowcase() {
  const reduce = useReducedMotion() === true
  // 0 watching · 1 one animal walks out · 2 alert raised · 3 alert held
  const [phase, setPhase] = useState(reduce ? 2 : 0)
  useEffect(() => {
    if (reduce) return
    const timer = setInterval(() => setPhase(current => (current + 1) % 4), PHASE_MS)
    return () => clearInterval(timer)
  }, [reduce])

  const out = phase >= 2
  const walkerAt = phase >= 1 ? walker.outside : walker.inside

  return (
    <figure className={styles.scene}>
      <div className={styles.dots} aria-hidden="true" />

      {/* The folded ribbon: three broad planes joined by darker returns, rising to the right. */}
      <svg className={styles.ribbon} viewBox="-60 380 960 320" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="rb-a" x1="0" x2="1"><stop offset="0" stopColor="var(--ribbon-1)" /><stop offset="1" stopColor="var(--ribbon-2)" /></linearGradient>
          <linearGradient id="rb-b" x1="0" x2="1"><stop offset="0" stopColor="var(--ribbon-3)" /><stop offset="1" stopColor="var(--ribbon-4)" /></linearGradient>
          <linearGradient id="rb-c" x1="0" x2="1"><stop offset="0" stopColor="var(--ribbon-5)" /><stop offset="1" stopColor="var(--ribbon-6)" /></linearGradient>
          <linearGradient id="rb-d" x1="0" x2="1"><stop offset="0" stopColor="var(--ribbon-7)" /><stop offset="1" stopColor="var(--ribbon-8)" /></linearGradient>
          <linearGradient id="rb-e" x1="0" x2="1"><stop offset="0" stopColor="var(--ribbon-9)" /><stop offset="1" stopColor="var(--ribbon-10)" /></linearGradient>
        </defs>
        <motion.g
          initial={reduce ? false : { opacity: 0, x: -60, y: 60 }} animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 1.1, ease: ease.out }}>
          <g className={styles.float}>
            <polygon points="-40,640 150,560 330,610 150,700" fill="url(#rb-a)" />
            <polygon points="150,700 330,610 360,660 190,700" fill="url(#rb-b)" />
            <polygon points="190,700 360,660 560,560 640,700" fill="url(#rb-c)" />
            <polygon points="360,660 560,560 620,600 520,700" fill="url(#rb-d)" opacity="0.9" />
            <polygon points="520,700 620,600 900,420 900,700" fill="url(#rb-e)" />
          </g>
        </motion.g>
      </svg>

      <header className={styles.top}>
        <BrandMark tone="on-dark" />
        <p className={styles.status}><span className={styles.statusDot} />Sistema en línea</p>
      </header>

      <div className={styles.stage} aria-hidden="true">
        <motion.div className={styles.camera}
          initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.25, ease: ease.out }}>
          <div className={styles.cameraBar}>
            <span className={styles.mono}>Potrero norte · en vivo</span>
            <span className={styles.mono}>{out ? '1 fuera de zona' : '4 en zona'}</span>
          </div>
          <svg className={styles.view} viewBox="0 130 640 270" preserveAspectRatio="xMidYMid slice" focusable="false">
            {/* Folded hills: schematic planes, not a picture. */}
            <polygon points="0,270 170,206 360,244 640,150 640,400 0,400" className={styles.hillBack} />
            <polygon points="0,320 230,270 430,300 640,236 640,400 0,400" className={styles.hillFront} />
            <polyline points="0,270 170,206 360,244 640,150" className={styles.ridge} />

            <motion.polygon points={zone} className={`${styles.zone} ${out ? styles.zoneBreach : ''}`}
              initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 1.4, delay: 0.7, ease: ease.fluid }} />

            {herd.map((cow, index) => (
              <motion.g key={cow.id}
                initial={reduce ? false : { opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                style={{ transformOrigin: `${cow.x + cow.w / 2}px ${cow.y + cow.h / 2}px` }}
                transition={{ delay: 1.2 + index * 0.18, duration: 0.4, ease: ease.out }}>
                <rect x={cow.x} y={cow.y} width={cow.w} height={cow.h} rx="6" className={styles.box} />
                <circle cx={cow.x + cow.w / 2} cy={cow.y + cow.h / 2} r="3" className={styles.centroid} />
                <text x={cow.x} y={cow.y - 6} className={styles.tag}>#{cow.id}</text>
              </motion.g>
            ))}

            <motion.g initial={false} animate={{ x: walkerAt.x, y: walkerAt.y }}
              transition={{ duration: reduce ? 0 : 1.6, ease: ease.fluid }}>
              <rect width="58" height="38" rx="6" className={`${styles.box} ${out ? styles.boxOut : ''}`} />
              <circle cx="29" cy="19" r="3" className={`${styles.centroid} ${out ? styles.centroidOut : ''}`} />
              <text x="0" y="-6" className={`${styles.tag} ${out ? styles.tagOut : ''}`}>{out ? '#4 · fuera de zona' : '#4'}</text>
            </motion.g>
          </svg>

          <motion.div className={styles.alert} initial={false}
            animate={{ opacity: out ? 1 : 0, y: out ? 0 : 10 }} transition={{ duration: 0.4, ease: ease.out }}>
            <span className={styles.alertDot} />
            <span>
              <strong>Alerta · animal fuera de zona</strong>
              <small className={styles.mono}>Potrero norte · ahora</small>
            </span>
          </motion.div>
        </motion.div>
      </div>

      <ul className={styles.features}>
        {features.map(({ icon: Icon, label }) => (
          <li key={label}><span className={styles.chip}><Icon size={15} strokeWidth={2} aria-hidden="true" /></span>{label}</li>
        ))}
      </ul>
    </figure>
  )
}
