import styles from './PlanMarkers.module.css'

/** Detection corners around a tracked animal; they stay square to the map while the body turns. */
const BRACKET = 'M-13 -6V-13H-6M6 -13H13V-6M13 6V13H6M-6 13H-13V6'

/**
 * A tracked animal as the camera sees it: a glowing point inside detection corners, with a pointed body
 * that faces where it walks (+x at heading 0). The rig rotates toward the walking direction and the
 * head group nods while grazing. Tone comes from the parent's --cow-status variable.
 */
export function CowFigure({ rigTransform }: { rigTransform?: string }) {
  return <g>
    <circle className={styles.halo} r="15" />
    <path className={styles.bracket} d={BRACKET} />
    <g data-rig="true" transform={rigTransform}>
      <path className={styles.body} d="M-7 0C-7 -4 -4.4 -5.6 0 -5.6C3.6 -5.6 6 -3.4 7.4 0C6 3.4 3.6 5.6 0 5.6C-4.4 5.6 -7 4 -7 0Z" />
      <g data-head="true">
        <path className={styles.heading} d="M9.4 -3.4L13.6 0L9.4 3.4" />
      </g>
      <circle className={styles.core} r="2.2" />
    </g>
  </g>
}

/** Top-down person (shoulders, head and hands) inside a yellow badge. */
export function PersonFigure({ shadowId, rigTransform }: {
  shadowId: string
  rigTransform?: string
}) {
  return <>
    <ellipse className={styles.shadow} cx="1" cy="2.5" rx="17" ry="15" fill={`url(#${shadowId})`} />
    <circle className={styles.badge} r="13" />
    <circle className={styles.badgeRing} r="10.8" />
    <g data-rig="true" transform={rigTransform}>
      <rect className={styles.shoulders} x="-3.4" y="-7.8" width="6" height="15.6" rx="3" />
      <circle className={styles.hand} cx="3.6" cy="-6.6" r="1.7" />
      <circle className={styles.hand} cx="3.6" cy="6.6" r="1.7" />
      <circle className={styles.personHead} cx="0.2" cy="0" r="3.9" />
      <path className={styles.facing} d="M4.6 -1.5L6.8 0L4.6 1.5Z" />
    </g>
  </>
}
