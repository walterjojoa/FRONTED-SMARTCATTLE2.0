import { BrandMark } from '../../../components/ui'
import { CountUp, Reveal } from '../../../motion'
import styles from '../LandingPage.module.css'

const stats = [
  { value: 0, caption: 'collares, chapetas ni GPS que comprar o cargar' },
  { value: 1, caption: 'cámara basta para empezar a vigilar un potrero' },
  { value: 2, caption: 'roles, cada uno con su propia vista de la finca' },
]

/** One softly lit proof interruption, then three plain numerals. The text is an editorial observation, not a customer quote. */
export function Proof() {
  return (
    <section className={`${styles.rail} ${styles.block} ${styles.proofBlock}`} aria-label="Cómo queda cada hallazgo">
      <Reveal inView>
        <figure className={styles.proof}>
          <span className={styles.proofGlow} aria-hidden="true" />
          <BrandMark size="sm" />
          <blockquote className={styles.quote}>
            Cada alerta guarda la cámara, la hora y la imagen. Revisas qué pasó sin rebobinar horas de video.
          </blockquote>
          <figcaption className={styles.attribution}>Eventos · cómo se registra cada hallazgo</figcaption>
          <p className={styles.outcome}>1 alerta → 1 cámara, 1 hora, 1 imagen</p>
        </figure>
      </Reveal>

      <ul className={styles.stats}>
        {stats.map(stat => (
          <li key={stat.caption}>
            <p className={styles.stat}><CountUp value={stat.value} /></p>
            <p className={styles.statCaption}>{stat.caption}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
