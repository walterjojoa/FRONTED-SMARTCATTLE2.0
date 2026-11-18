import { useEffect, useId, useRef, useState, type RefObject } from 'react'
import { buildFilterSvg, generateDisplacementUrl, supportsRefraction } from './refraction'

export interface RefractionTuning {
  bevelDepth?: number
  scale?: number
  aberration?: number
  frost?: number
}

/**
 * Builds a per-element refraction filter sized to `ref`'s border box. Returns the filter id and
 * its SVG markup once ready; null while pending, when disabled, or where the browser can't do it.
 */
export function useRefraction(ref: RefObject<HTMLElement | null>, enabled: boolean, tuning: RefractionTuning = {}) {
  const { bevelDepth = 14, scale = 36, aberration = 3, frost = 0.4 } = tuning
  const reactId = useId().replace(/:/g, '')
  const blob = useRef<string | null>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [filter, setFilter] = useState<{ id: string; svg: string } | null>(null)
  const [capable] = useState(() => enabled && typeof window !== 'undefined' && supportsRefraction())

  useEffect(() => {
    const el = ref.current
    if (!el || !capable) return
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      const box = entry.borderBoxSize?.[0]
      setSize({
        w: Math.max(1, Math.round(box?.inlineSize ?? entry.contentRect.width)),
        h: Math.max(1, Math.round(box?.blockSize ?? entry.contentRect.height)),
      })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, capable])

  useEffect(() => {
    const el = ref.current
    if (!capable || !el || size.w <= 1 || size.h <= 1) return
    let cancelled = false
    void (async () => {
      const cssRadius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0
      const url = await generateDisplacementUrl({
        width: size.w,
        height: size.h,
        radius: Math.min(cssRadius, size.w / 2, size.h / 2),
        bevelDepth: Math.min(bevelDepth, Math.min(size.w, size.h) / 2),
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      })
      await new Promise<void>(resolve => {
        const image = new Image()
        image.onload = image.onerror = () => resolve()
        image.src = url
      })
      if (cancelled) { URL.revokeObjectURL(url); return }
      if (blob.current) URL.revokeObjectURL(blob.current)
      blob.current = url
      // A fresh id per rebuild: browsers cache filter output by id.
      const id = `sc-lg-${reactId}-${size.w}x${size.h}-${Date.now().toString(36)}`
      setFilter({ id, svg: buildFilterSvg({ id, mapUrl: url, width: size.w, height: size.h, scale, aberration, frost }) })
    })()
    return () => { cancelled = true }
  }, [ref, capable, size.w, size.h, bevelDepth, scale, aberration, frost, reactId])

  useEffect(() => () => { if (blob.current) URL.revokeObjectURL(blob.current) }, [])

  return filter
}
