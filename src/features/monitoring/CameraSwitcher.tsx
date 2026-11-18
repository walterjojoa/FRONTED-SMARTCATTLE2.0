import { useEffect, useId, useRef } from 'react'
import { TriangleAlert, VideoOff } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router'
import type { Camera, Severity } from '../../types/domain'
import styles from './CameraSwitcher.module.css'

interface CameraSwitcherProps {
  cameras: readonly Camera[]
  selectedId: string | null
  alertByCamera: ReadonlyMap<string, Severity>
  /** Cameras that deliver a picture; others are labeled "sin video" when online. */
  withVideo?: ReadonlySet<string>
  /** Still-image URLs by camera id. Cameras without one (MJPEG streams, no picture) show a placeholder. */
  thumbs?: ReadonlyMap<string, string>
}

const statusLabel: Record<Camera['status'], string> = {
  online: 'En línea', connecting: 'Conectando', offline: 'Sin conexión', error: 'Con error',
}

const indicatorSpring = { type: 'spring', stiffness: 380, damping: 30 } as const

/** A strip of camera thumbnails under the viewfinder: pick one, keep the others in sight. */
export function CameraSwitcher({ cameras, selectedId, alertByCamera, withVideo, thumbs }: CameraSwitcherProps) {
  const listRef = useRef<HTMLUListElement>(null)
  const reduce = useReducedMotion()
  const indicatorId = `camera-indicator-${useId()}`
  // When the strip scrolls, bring the selected camera into view without moving the page.
  useEffect(() => {
    const list = listRef.current
    const selected = list?.querySelector<HTMLElement>('[aria-current="true"]')?.parentElement
    if (!list || !selected || list.scrollWidth <= list.clientWidth) return
    list.scrollLeft = selected.offsetLeft - list.offsetLeft - 16
  }, [selectedId, cameras.length])

  return <nav className={styles.switcher} aria-label="Cámaras">
    <ul className={styles.list} ref={listRef}>
      {cameras.map(camera => {
        const severity = alertByCamera.get(camera.id)
        const selected = camera.id === selectedId
        const thumb = thumbs?.get(camera.id)
        const noVideo = camera.status === 'online' && withVideo && !withVideo.has(camera.id)
        return <li key={camera.id}>
          <Link className={`${styles.item} ${selected ? styles.selected : ''}`}
            to={`?camera=${encodeURIComponent(camera.id)}`} replace aria-current={selected ? 'true' : undefined}>
            {selected && <motion.span className={styles.indicator} layoutId={indicatorId} aria-hidden="true"
              transition={reduce ? { duration: 0 } : indicatorSpring} />}
            <span className={styles.thumb}>
              {thumb
                ? <img className={styles.img} src={thumb} alt="" loading="lazy" />
                : <span className={styles.placeholder} aria-hidden="true"><VideoOff size={18} strokeWidth={1.5} /></span>}
              <span className={`${styles.dot} ${styles[camera.status]}`} aria-hidden="true" />
              {severity && <TriangleAlert className={`${styles.alert} ${styles[severity]}`} size={14} strokeWidth={2.25}
                role="img" aria-label="Con alerta reciente" />}
            </span>
            <span className={styles.name}>{camera.name}</span>
            <span className={styles.meta}>{camera.location} · {statusLabel[camera.status]}{noVideo ? ' · sin video' : ''}</span>
          </Link>
        </li>
      })}
    </ul>
  </nav>
}
