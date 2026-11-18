import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import { motion, useReducedMotion } from 'motion/react'
import { FoldedRibbon } from '../../../components/brand/FoldedRibbon'
import { MaskedText } from '../../../motion'
import styles from '../LandingPage.module.css'

const capabilities = [
  'Detección de ganado', 'Zonas seguras', 'Alertas en vivo', 'Informe diario',
  'Potrero 3D', 'Dueño y trabajador', 'Asistente Lucero', 'Cámaras IP y celular',
]

/** Two-tone promise on the left, the folded sculpture climbing the right, a capability marquee underneath. */
export function HeroReveal() {
  const reduce = useReducedMotion() === true
  const rise = (delay: number) => reduce ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const } }

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <span className={`${styles.heroGlow} ${styles.heroGlowA}`} aria-hidden="true" />
      <span className={`${styles.heroGlow} ${styles.heroGlowB}`} aria-hidden="true" />
      <div className={styles.ribbonWrap}><FoldedRibbon /></div>

      <div className={`${styles.rail} ${styles.heroRail}`}>
        <motion.a className={styles.badge} href="#como-funciona" {...rise(0.05)}>
          Zonas seguras con alerta en vivo<ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
        </motion.a>
        <h1 id="hero-title" className={styles.heroTitle}>
          <MaskedText text="Vigilancia de ganado" delay={0.12} className={styles.heroLead} />{' '}
          <MaskedText text="con las cámaras que ya tienes, sin collares ni GPS." delay={0.32} className={styles.heroCont} />
        </h1>
        <motion.div className={styles.heroActions} {...rise(0.85)}>
          <Link className={styles.btnPrimary} to="/register">Crear cuenta<ArrowRight size={16} strokeWidth={2} aria-hidden="true" /></Link>
          <a className={styles.btnOutline} href="#como-funciona">Ver cómo funciona</a>
        </motion.div>
      </div>

      <div className={styles.marquee} aria-label="Capacidades">
        <ul className={styles.marqueeTrack}>
          {[...capabilities, ...capabilities].map((item, index) => (
            <li key={`${item}-${index}`} aria-hidden={index >= capabilities.length || undefined}><span className={styles.marqueeDot} />{item}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
