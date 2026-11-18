import { useRef, type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode } from 'react'
import styles from './LiquidGlass.module.css'
import { useRefraction, type RefractionTuning } from './useRefraction'

export type LiquidGlassTone = 'default' | 'strong' | 'subtle' | 'brand' | 'dark'

export interface LiquidGlassProps extends HTMLAttributes<HTMLElement>, RefractionTuning {
  as?: ElementType
  tone?: LiquidGlassTone
  /** Radius token or any CSS length. Defaults to --radius-xl. */
  radius?: string
  /** Bend the backdrop with a Snell's-law displacement map (Chromium only; frosted glass elsewhere). */
  refract?: boolean
  interactive?: boolean
  /** Class for the inner wrapper that holds the children, for layout (grid, flex). */
  contentClassName?: string
  children?: ReactNode
}

/** A translucent panel: frosted backdrop, tint, specular rim, hairline shadow, optional real refraction. */
export function LiquidGlass({
  as: Tag = 'div',
  tone = 'default',
  radius,
  refract = false,
  interactive = false,
  bevelDepth,
  scale,
  aberration,
  frost,
  contentClassName,
  className,
  style,
  children,
  ...rest
}: LiquidGlassProps) {
  const root = useRef<HTMLElement>(null)
  const filter = useRefraction(root, refract, { bevelDepth, scale, aberration, frost })

  const cls = [styles.glass, tone !== 'default' && styles[tone], interactive && styles.interactive, className]
    .filter(Boolean)
    .join(' ')
  const merged = radius ? ({ ...style, '--glass-radius': radius } as CSSProperties) : style
  const lens = filter ? `url(#${filter.id}) blur(0.5px) saturate(1.85) brightness(1.02)` : undefined

  return (
    <Tag ref={root} className={cls} style={merged} {...rest}>
      <span
        className={`${styles.layer} ${styles.backdrop}`}
        style={lens ? { WebkitBackdropFilter: lens, backdropFilter: lens } : undefined}
        aria-hidden="true"
      />
      <span className={`${styles.layer} ${styles.specular}`} aria-hidden="true" />
      {filter && <span key={filter.id} className={styles.filterHost} aria-hidden="true" dangerouslySetInnerHTML={{ __html: filter.svg }} />}
      <div className={[styles.content, contentClassName].filter(Boolean).join(' ')}>{children}</div>
    </Tag>
  )
}
