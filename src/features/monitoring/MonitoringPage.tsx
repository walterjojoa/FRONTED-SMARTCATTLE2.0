import { useEffect, useState, type ReactNode } from 'react'
import { ChevronDown, RefreshCw, Video } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router'
import { EventRow } from '../../components/events/EventRow'
import { Button, EmptyState, ErrorState, Notice, StatusPill } from '../../components/ui'
import { useResource } from '../../lib/useResource'
import { FadeUp, staggerDelay } from '../../motion'
import { getCameraStream, getFrameDetections, getSystemStatus, hasPicture, listEvents, listSafeZones, loadCameraSnapshots } from '../../services'
import { useLiveCameras } from '../../live/useLiveCameras'
import type { Severity } from '../../types/domain'
import { recentAlerts } from '../dashboard/dashboardModel'
import { CameraStage } from './CameraStage'
import { CameraSwitcher } from './CameraSwitcher'
import type { OverlayLayers } from './DetectionOverlay'
import { LayerToggles } from './LayerToggles'
import { pickCamera } from './monitoringModel'
import styles from './MonitoringPage.module.css'

const liveRefreshMs = 15_000
const frameRefreshMs = 2_000
const cameraRefreshMs = 5_000

function Header({ actions }: { actions?: ReactNode }) {
  return <FadeUp className={styles.head}>
    <div className={styles.headText}>
      <h1 className={styles.title}>En vivo</h1>
      <p className={styles.lead}>Cada cámara con sus detecciones y la zona segura, actualizadas cada pocos segundos.</p>
    </div>
    {actions}
  </FadeUp>
}

export function MonitoringPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [layers, setLayers] = useState<OverlayLayers>({ boxes: true, zones: true, labels: true })
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(timer)
  }, [])

  // Polled faster than the rest so a camera that connects or disconnects shows up within seconds.
  const cameras = useLiveCameras({ onlineOnly: true })
  const events = useResource(signal => listEvents({ signal }), { refreshMs: liveRefreshMs })
  const status = useResource(signal => getSystemStatus({ signal }), { refreshMs: liveRefreshMs })

  const alerts = recentAlerts(events.data ?? [], now)
  const camera = pickCamera(cameras.data ?? [], searchParams.get('camera'), alerts)
  const cameraId = camera?.id ?? ''
  // Polled so the video appears once the AI service starts, without reloading the page.
  const stream = useResource(signal => getCameraStream(cameraId, { signal }), { key: cameraId, refreshMs: cameraRefreshMs })
  const frame = useResource(signal => getFrameDetections(cameraId, { signal }), { key: cameraId, refreshMs: frameRefreshMs })
  const zones = useResource(signal => listSafeZones(cameraId, { signal }), { key: cameraId })
  const ids = (cameras.data ?? []).map(item => item.id)
  const snapshots = useResource(signal => loadCameraSnapshots(ids, signal), { key: ids.join(','), refreshMs: liveRefreshMs })
  const withVideo = snapshots.data ? new Set(ids.filter(id => hasPicture(snapshots.data?.[id]?.stream))) : undefined
  // Still images only: an MJPEG thumbnail would hold a stream open per camera.
  const thumbs = new Map<string, string>()
  for (const id of ids) {
    const source = snapshots.data?.[id]?.stream
    if (source?.kind === 'image') thumbs.set(id, source.url)
  }

  const alertByCamera = new Map<string, Severity>()
  // One tap re-asks everything and restarts the picture: a stuck MJPEG remounts via mediaKey.
  const [mediaKey, setMediaKey] = useState(0)
  const refreshAll = () => {
    cameras.reload(); events.reload(); status.reload()
    stream.reload(); frame.reload(); zones.reload(); snapshots.reload()
    setMediaKey(key => key + 1)
  }
  for (const alert of alerts) if (!alertByCamera.has(alert.cameraId)) alertByCamera.set(alert.cameraId, alert.severity)
  const cameraEvents = (events.data ?? []).filter(event => event.cameraId === cameraId).slice(0, 5)
  const live = stream.data?.kind === 'image' || stream.data?.kind === 'mjpeg'
  const synthetic = stream.data?.kind === 'image' && stream.data.synthetic
  const burnedIn = stream.data?.kind === 'mjpeg' && stream.data.annotated === true

  if (cameras.status === 'success' && !cameras.data) {
    return <div className={styles.page}>
      <Header />
      <FadeUp delay={staggerDelay(1)} className={styles.card}>
        <ErrorState title="Cámaras no disponibles"
          description="El servidor todavía no ofrece la lista de cámaras ni sus transmisiones." />
      </FadeUp>
    </div>
  }
  if (cameras.status === 'success' && cameras.data?.length === 0) {
    return <div className={styles.page}>
      <Header />
      <FadeUp delay={staggerDelay(1)} className={styles.card}>
        <EmptyState title="No hay cámaras conectadas" description="Usa este celular como cámara: sin instalar nada, solo dale a Transmitir."
          action={<Button icon={Video} onClick={() => void navigate('/cameras?con=celular')}>Conectar en 1 paso</Button>} />
      </FadeUp>
    </div>
  }

  return <div className={styles.page}>
    <Header actions={<>
      {live && <span className={styles.livePill}>
        <span className={styles.liveDot} aria-hidden="true" />{synthetic ? 'Demostración en vivo' : 'Transmisión en vivo'}
      </span>}
      <Button variant="secondary" size="sm" icon={RefreshCw} onClick={refreshAll}>Actualizar todo</Button>
    </>} />
    {status.data?.backend === 'offline' && <Notice className={styles.notice} tone="critical" title="Sin conexión con el servidor">
      Las alertas y eventos pueden estar desactualizados. Se reintenta automáticamente.
    </Notice>}
    {status.data?.aiConfigured === false && <Notice className={styles.notice} tone="warning" title="Visión artificial sin configurar">
      El servidor no tiene un servicio de visión configurado, así que no habrá detecciones.
    </Notice>}

    <div className={styles.layout}>
      <FadeUp delay={staggerDelay(1)} className={styles.main}>
        <div className={styles.stageFrame}>
          <CameraStage camera={camera} stream={stream.data} streamLoading={stream.status === 'loading' || cameras.status === 'loading'}
            frame={frame.data} zones={zones.data ?? []} layers={layers} mediaKey={mediaKey}
            aiConfigured={status.data?.aiConfigured ?? null} now={now}
            controls={live && !burnedIn ? <LayerToggles layers={layers} onChange={setLayers} disabled={false} /> : undefined} />
        </div>
        {synthetic && <p className={styles.synthetic}>Imagen ilustrativa con detecciones simuladas</p>}
        {cameras.data && <section aria-labelledby="cameras-title">
          <h2 id="cameras-title" className="visually-hidden">Cámaras</h2>
          <CameraSwitcher cameras={cameras.data} selectedId={camera?.id ?? null} alertByCamera={alertByCamera} withVideo={withVideo} thumbs={thumbs} />
        </section>}
      </FadeUp>

      <aside className={styles.aside}>
        <FadeUp delay={staggerDelay(2)} className={styles.card}>
          <details className={styles.fold} open>
            <summary className={styles.foldSummary}>
              <h2 id="camera-events-title" className={styles.sectionTitle}>
                Eventos{camera ? ` · ${camera.name}` : ''}
              </h2>
              <ChevronDown className={styles.chevron} size={18} strokeWidth={2} aria-hidden="true" />
            </summary>
            {events.status === 'error' && !events.data
              ? <ErrorState description="No se pudieron cargar los eventos." onRetry={events.reload} />
              : cameraEvents.length === 0 && events.status === 'success'
                ? <p className={styles.empty}>Sin eventos recientes en esta cámara.</p>
                : <ol className={styles.events}>{cameraEvents.map(event => <EventRow key={event.id} event={event} now={now} />)}</ol>}
          </details>
        </FadeUp>

        <FadeUp delay={staggerDelay(3)} className={styles.card}>
          <section aria-labelledby="services-title">
            <h2 id="services-title" className={styles.sectionTitle}>Servicios</h2>
            <ul className={styles.services}>
              <li>{!status.data ? <StatusPill tone="inactive" label="Servidor: comprobando" />
                : status.data.backend === 'online' ? <StatusPill tone="safe" label="Servidor en línea" />
                  : <StatusPill tone="critical" label="Servidor sin conexión" />}</li>
              <li>{status.data?.aiConfigured === true ? <StatusPill tone="safe" label="Visión configurada" />
                : status.data?.aiConfigured === false ? <StatusPill tone="warning" label="Visión sin configurar" />
                  : <StatusPill tone="inactive" label="Visión: sin datos" />}</li>
              <li>{live ? <StatusPill tone={synthetic ? 'info' : 'safe'} label={synthetic ? 'Video: demostración' : 'Video en vivo'} />
                : <StatusPill tone="inactive" label="Video: sin transmisión" />}</li>
            </ul>
          </section>
        </FadeUp>
      </aside>
    </div>
  </div>
}
