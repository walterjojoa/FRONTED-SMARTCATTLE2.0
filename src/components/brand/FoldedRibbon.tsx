import { useId } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ease } from '../../motion'
import styles from './FoldedRibbon.module.css'

/*
 * An ascending folded sculpture: three broad slanted planes (lime to leaf, mint to teal, sky to blue)
 * joined by darker return strips, rising from lower left to upper right. Original geometry, drawn from
 * the design system's colour progression. The planes enter in sequence, the whole object then floats,
 * and it drifts with the page scroll.
 */
const planes = [
  { points: '245,386 661,386 416,1059 0,1059', from: 'var(--ribbon-1)', to: 'var(--ribbon-2)' },
  { points: '597,193 1013,193 768,866 352,866', from: 'var(--ribbon-5)', to: 'var(--ribbon-6)' },
  { points: '949,0 1700,0 1700,673 1120,673', from: 'var(--ribbon-9)', to: 'var(--ribbon-10)' },
]
const returns = [
  { points: '661,386 597,193 352,866 416,1059', from: 'var(--ribbon-3)', to: 'var(--ribbon-4)' },
  { points: '1013,193 949,0 704,673 768,866', from: 'var(--ribbon-7)', to: 'var(--ribbon-8)' },
]

export function FoldedRibbon({ className, parallax = true }: { className?: string; parallax?: boolean }) {
  const reduce = useReducedMotion() === true
  const uid = useId().replace(/:/g, '')
  const { scrollY } = useScroll()
  const drift = useTransform(scrollY, [0, 900], [0, -70])

  const faces = [
    ...returns.map((face, index) => ({ ...face, key: `r${index}`, order: index * 2 + 1 })),
    ...planes.map((face, index) => ({ ...face, key: `p${index}`, order: index * 2 })),
  ]

  return (
    <motion.svg className={[styles.ribbon, className].filter(Boolean).join(' ')} viewBox="0 0 1700 1059" preserveAspectRatio="xMaxYMax meet"
      aria-hidden="true" focusable="false" style={parallax && !reduce ? { y: drift } : undefined}>
      <defs>
        {faces.map(face => (
          <linearGradient key={face.key} id={`${uid}-${face.key}`} x1="0" x2="1">
            <stop offset="0" stopColor={face.from} />
            <stop offset="1" stopColor={face.to} />
          </linearGradient>
        ))}
      </defs>
      <g className={styles.float}>
        {faces.map(face => (
          <motion.polygon key={face.key} points={face.points} fill={`url(#${uid}-${face.key})`}
            initial={reduce ? false : { opacity: 0, y: 120 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.15 + face.order * 0.11, ease: ease.out }} />
        ))}
      </g>
    </motion.svg>
  )
}
