import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import { useReducedMotion } from 'motion/react'
import { Reveal } from '../../../motion'
import styles from '../LandingPage.module.css'

const steps = [
  { n: '01', lead: 'Cámara.', text: 'Una cámara IP, o la de un celular, envía la imagen al servicio de visión.' },
  { n: '02', lead: 'Visión artificial.', text: 'Un modelo de detección encuentra ganado y personas en cada cuadro.' },
  { n: '03', lead: 'Zona segura.', text: 'Cada animal se compara con el lindero que dibujaste una sola vez.' },
  { n: '04', lead: 'Alerta.', text: 'Si sale de la zona o aparece una persona, avisa y guarda el evento.' },
]

const nodes = [
  { y: 24, label: 'Cámara', sub: 'rtsp · celular', chip: 'var(--color-lime)' },
  { y: 124, label: 'Visión artificial', sub: 'detección por cuadro', chip: 'var(--color-action)' },
  { y: 224, label: 'Zona segura', sub: 'lindero del lote', chip: 'var(--ribbon-10)' },
  { y: 324, label: 'Alerta', sub: 'evento + imagen', chip: '#FFB547' },
]

/** Reversed technical chapter: what happens between the camera and the alert, drawn as one downward flow. */
export function Mechanism() {
  const reduce = useReducedMotion() === true
  return (
    <section className={styles.dark} aria-labelledby="mechanism-title">
      <div className={styles.rail}>
        <h2 id="mechanism-title" className={`${styles.pairTitle} ${styles.pairDark}`}>
          <span className={styles.pairLead}>De la cámara a la alerta.</span>{' '}
          <span className={styles.pairCont}>Cuatro pasos, una sola dirección de lectura.</span>
        </h2>

        <div className={styles.technical}>
          <ol className={styles.steps}>
            {steps.map(step => (
              <li key={step.n}>
                <Reveal inView>
                  <p className={styles.stepNo}>{step.n}</p>
                  <p className={styles.darkRow}><span className={styles.darkLead}>{step.lead}</span> <span className={styles.darkCont}>{step.text}</span></p>
                </Reveal>
              </li>
            ))}
            <li><Link className={styles.techLink} to="/register">Crear cuenta<ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" /></Link></li>
          </ol>

          <div className={styles.schematic} aria-hidden="true">
            <svg viewBox="0 0 480 408" focusable="false">
              {[84, 184, 284].map(y => (
                <g key={y}>
                  <line x1="240" y1={y} x2="240" y2={y + 40} className={styles.flowLine} />
                  <path d={`M233 ${y + 32} L240 ${y + 40} L247 ${y + 32}`} className={styles.flowArrow} />
                </g>
              ))}
              {!reduce && (
                <circle r="4" className={styles.packet}>
                  <animateMotion dur="4.8s" repeatCount="indefinite" path="M240 54 V 354" keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
                </circle>
              )}
              {nodes.map(node => (
                <g key={node.label}>
                  <rect x="80" y={node.y} width="320" height="60" rx="12" className={styles.node} />
                  <rect x="100" y={node.y + 21} width="18" height="18" rx="4" fill={node.chip} />
                  <text x="132" y={node.y + 27} className={styles.nodeLabel}>{node.label}</text>
                  <text x="132" y={node.y + 45} className={styles.nodeSub}>{node.sub}</text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
