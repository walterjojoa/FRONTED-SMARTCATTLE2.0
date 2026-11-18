import type { CSSProperties } from 'react'
import { detectedObjectLabel } from '../../lib/eventCatalog'
import { formatConfidence } from '../../lib/format'
import type { Detection, SafeZone } from '../../types/domain'
import { placeLabels } from './monitoringModel'
import styles from './DetectionOverlay.module.css'

export interface OverlayLayers { boxes: boolean; zones: boolean; labels: boolean }

interface DetectionOverlayProps {
  /** Pixel size of the picture; overlay coordinates are normalized and scaled to it. */
  width: number
  height: number
  detections: readonly Detection[]
  zones: readonly SafeZone[]
  layers: OverlayLayers
}

const kindClass = (detection: Detection) =>
  detection.insideSafeZone === false ? styles.outside : detection.label === 'person' ? styles.person : styles.cattle

/** Safe zones and detection boxes drawn over the camera picture. Decorative for assistive tech; the stage summarizes it in text. */
export function DetectionOverlay({ width, height, detections, zones, layers }: DetectionOverlayProps) {
  const placement = placeLabels(detections)
  const breached = detections.some(detection => detection.insideSafeZone === false)
  return <>
    <svg className={styles.svg} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
      {layers.zones && zones.map(zone => {
        const outline = zone.outline ?? [
          [zone.bounds[0], zone.bounds[1]], [zone.bounds[2], zone.bounds[1]],
          [zone.bounds[2], zone.bounds[3]], [zone.bounds[0], zone.bounds[3]],
        ] as const
        const points = outline.map(([x, y]) => [x * width, y * height] as const)
        const polygon = points.map(point => point.join(',')).join(' ')
        // When an animal leaves, the lindero turns critical and everything outside it takes a soft red tint.
        return <g key={zone.id} className={`${styles.zone} ${breached ? styles.breached : ''}`}>
          {breached && <path className={styles.outsideArea} fillRule="evenodd"
            d={`M0 0 H${width} V${height} H0 Z M${points.map(point => point.join(' ')).join(' L')} Z`} />}
          <polygon points={polygon} vectorEffect="non-scaling-stroke" />
          {points.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="5" />)}
        </g>
      })}
      {layers.boxes && detections.map(detection => <rect key={detection.id}
        className={`${styles.box} ${kindClass(detection)}`}
        x={detection.box.x * width} y={detection.box.y * height}
        width={detection.box.width * width} height={detection.box.height * height}
        rx="6" vectorEffect="non-scaling-stroke" />)}
    </svg>
    {layers.boxes && layers.labels && <div className={styles.labels} aria-hidden="true">
      {detections.map(detection => {
        const outside = detection.insideSafeZone === false
        const nearRight = detection.box.x + detection.box.width > 0.82
        const below = placement.get(detection.id) === 'below'
        return <span key={detection.id}
          className={[styles.label, kindClass(detection), nearRight && styles.alignRight, below && styles.below].filter(Boolean).join(' ')}
          style={{
            left: `${(nearRight ? detection.box.x + detection.box.width : detection.box.x) * 100}%`,
            top: `${(below ? detection.box.y + detection.box.height : detection.box.y) * 100}%`,
          } as CSSProperties}>
          {outside ? 'fuera de zona' : detectedObjectLabel(detection.label)} · {formatConfidence(detection.confidence)}
        </span>
      })}
      {layers.zones && zones.map(zone => {
        const [x, y] = (zone.outline ?? [[zone.bounds[0], zone.bounds[1]]])[0]
        return <span key={zone.id} className={`${styles.zoneLabel} ${breached ? styles.breached : ''}`} style={{ left: `${x * 100}%`, top: `${y * 100}%` }}>
          {zone.name}
        </span>
      })}
    </div>}
  </>
}
