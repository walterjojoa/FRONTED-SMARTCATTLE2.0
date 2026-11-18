import { motion, useReducedMotion } from 'motion/react'
import { Reveal } from '../../../motion'
import styles from '../LandingPage.module.css'

const rows = [
  { id: '#1', label: 'bovino', score: '0,94', out: false },
  { id: '#2', label: 'bovino', score: '0,91', out: false },
  { id: '#3', label: 'bovino', score: '0,89', out: false },
  { id: '#4', label: 'bovino · fuera de zona', score: '0,92', out: true },
]

const posture = [
  { name: 'Echado', share: 0.52 },
  { name: 'De pie', share: 0.31 },
  { name: 'Caminando', share: 0.17 },
]

function DetectionScene() {
  return (
    <div className={styles.sceneSplit}>
      <div className={styles.frag}>
        <p className={styles.mono}>Potrero norte · en vivo</p>
        <ul className={styles.rows}>
          {rows.map(row => (
            <li key={row.id} data-out={row.out || undefined}>
              <span className={styles.rowDot} />
              <span>{row.label} <span className={styles.mono}>{row.id}</span></span>
              <em className={styles.mono}>{row.score}</em>
            </li>
          ))}
        </ul>
      </div>
      <pre className={styles.code} aria-label="Ejemplo de evento">{`{
  "evento": "fuera_de_zona",
  "camara": "Potrero Sur",
  "detectado": "bovino",
  "confianza": 0.92,
  "hora": "11:41"
}`}</pre>
    </div>
  )
}

function ZoneScene() {
  return (
    <svg className={styles.zoneSvg} viewBox="0 0 420 190" aria-hidden="true" focusable="false">
      <polygon points="40,52 250,34 290,150 30,164" className={styles.zonePoly} />
      {[[88, 100], [140, 92], [198, 110], [120, 132]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="5" className={styles.zoneIn} />)}
      <circle cx="352" cy="74" r="5" className={styles.zoneOut} />
      <circle cx="352" cy="74" r="5" className={styles.zonePing} />
      <text x="330" y="102" className={styles.zoneTag}>fuera de zona</text>
    </svg>
  )
}

function RolesScene() {
  return (
    <div className={styles.roles}>
      <div className={styles.frag}><p className={styles.fragTitle}>Dueño</p><p className={styles.fragText}>Panorama de la finca, informe diario y ajustes.</p></div>
      <div className={styles.frag}><p className={styles.fragTitle}>Trabajador</p><p className={styles.fragText}>Alertas y cámaras, sin lo que no necesita.</p></div>
    </div>
  )
}

function ChatScene() {
  return (
    <div className={styles.chat}>
      <p className={styles.chatYou}>¿Qué pasó anoche?</p>
      <p className={styles.chatHer}>Las cámaras observaron 9 horas. Hubo 1 alerta y ya está atendida.</p>
      <p className={styles.mono}>Ejemplo de conversación</p>
    </div>
  )
}

function ReportScene() {
  const reduce = useReducedMotion() === true
  return (
    <div className={`${styles.frag} ${styles.report}`}>
      <p className={styles.mono}>Informe diario · ejemplo</p>
      {posture.map((row, index) => (
        <div key={row.name} className={styles.bar}>
          <span>{row.name}</span>
          <span className={styles.barTrack}>
            <motion.span className={styles.barFill} style={{ transformOrigin: 'left' }}
              initial={reduce ? { scaleX: row.share } : { scaleX: 0 }} whileInView={{ scaleX: row.share }} viewport={{ once: true }}
              transition={{ duration: 0.9, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }} />
          </span>
          <span className={styles.mono}>{Math.round(row.share * 100)} %</span>
        </div>
      ))}
    </div>
  )
}

export function Bento() {
  return (
    <section id="funciones" className={`${styles.rail} ${styles.block}`} aria-labelledby="bento-title">
      <h2 id="bento-title" className={styles.pairTitle}>
        <span className={styles.pairLead}>Todo lo que necesitas, nada de lo que no.</span>{' '}
        <span className={styles.pairCont}>Cada capacidad muestra su resultado, no una promesa.</span>
      </h2>
      <div className={styles.mosaic}>
        <Reveal inView className={`${styles.tile} ${styles.span12}`}>
          <h3 className={styles.tileTitle}>Sin collares, sin chapetas, sin GPS.</h3>
          <p className={styles.tileText}>La visión por computadora trabaja sobre la imagen de tus cámaras y deja cada hallazgo como un evento.</p>
          <DetectionScene />
        </Reveal>
        <Reveal inView delay={0.05} className={`${styles.tile} ${styles.span7}`}>
          <h3 className={styles.tileTitle}>Marca el lindero una vez.</h3>
          <p className={styles.tileText}>Cada salida de la zona segura queda registrada para revisar.</p>
          <ZoneScene />
        </Reveal>
        <Reveal inView delay={0.1} className={`${styles.tile} ${styles.span5}`}>
          <h3 className={styles.tileTitle}>Dueño y trabajador.</h3>
          <p className={styles.tileText}>Cada rol ve lo que necesita.</p>
          <RolesScene />
        </Reveal>
        <Reveal inView delay={0.05} className={`${styles.tile} ${styles.span5}`}>
          <h3 className={styles.tileTitle}>Pregúntale a Lucero.</h3>
          <p className={styles.tileText}>Responde con los datos de tu finca.</p>
          <ChatScene />
        </Reveal>
        <Reveal inView delay={0.1} className={`${styles.tile} ${styles.span7}`}>
          <h3 className={styles.tileTitle}>Tu día, ya resumido.</h3>
          <p className={styles.tileText}>Tiempo observado, qué hizo el ganado y las alertas del día. No es un diagnóstico veterinario.</p>
          <ReportScene />
        </Reveal>
      </div>
    </section>
  )
}
