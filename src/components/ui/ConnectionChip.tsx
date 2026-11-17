import { CloudOff, FlaskConical, RefreshCw, VideoOff, type LucideIcon } from 'lucide-react'
import type { LiveConnection } from '../../live/liveState'
import styles from './ConnectionChip.module.css'

const copy: Record<LiveConnection, { label: string; title: string; icon: LucideIcon | null }> = {
  live: { label: 'En vivo', title: 'Los cambios llegan del servidor en cuanto ocurren.', icon: null },
  polling: { label: 'Actualizando cada 5 s', title: 'El servidor no envía cambios en vivo; se consultan cada 5 segundos.', icon: RefreshCw },
  connecting: { label: 'Conectando…', title: 'Cargando el estado de la finca.', icon: RefreshCw },
  offline: { label: 'Sin conexión', title: 'No hay respuesta del servidor. Se muestra lo último que llegó y se reintenta solo.', icon: CloudOff },
  demo: { label: 'Datos de demostración', title: 'Modo demostración: la IA está simulada en el navegador.', icon: FlaskConical },
}

const NO_CAMERAS = {
  label: 'Sin cámaras',
  title: 'No hay ninguna cámara conectada, así que no llega nada que mostrar.',
  icon: VideoOff as LucideIcon | null,
}

/**
 * Where the numbers on screen come from right now: one glance answers "is this live?".
 *
 * A live socket with no camera on the other end still said "En vivo", which answered
 * the wrong question: the link was up, nothing was watching.
 */
export function ConnectionChip({ connection, cameras = null, className }: {
  connection: LiveConnection
  /** Cameras delivering a picture; null while unknown. Zero outranks the connection. */
  cameras?: number | null
  className?: string
}) {
  const { label, title, icon: Icon } = cameras === 0 && connection !== 'demo' ? NO_CAMERAS : copy[connection]
  const tone = cameras === 0 && connection !== 'demo' ? 'offline' : connection
  return <span className={[styles.chip, styles[tone], className].filter(Boolean).join(' ')} title={title} role="status">
    {Icon ? <Icon size={15} strokeWidth={2} aria-hidden="true" /> : <span className={styles.dot} aria-hidden="true" />}
    {label}
  </span>
}
