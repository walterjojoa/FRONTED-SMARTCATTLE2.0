import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { LiquidGlass } from '../../../components/glass'
import { BrandMark } from '../../../components/ui'
import styles from '../LandingPage.module.css'

/** A floating glass pill that tightens once the page has moved. */
export function NavGlass() {
  const [compact, setCompact] = useState(false)
  useEffect(() => {
    const onScroll = () => setCompact(globalThis.scrollY > 24)
    onScroll()
    globalThis.addEventListener('scroll', onScroll, { passive: true })
    return () => globalThis.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <header className={styles.navWrap}>
      <LiquidGlass as="nav" radius="12px" tone="strong" className={styles.nav} data-compact={compact || undefined} aria-label="Principal">
        <div className={styles.navInner}>
          <Link to="/bienvenida" className={styles.navBrand} aria-label="SmartCattle, inicio"><BrandMark size="md" /></Link>
          <div className={styles.navLinks}>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#funciones">Funciones</a>
            <Link to="/login">Ingresar</Link>
          </div>
          <Link className={styles.navCta} to="/register">Crear cuenta</Link>
        </div>
      </LiquidGlass>
    </header>
  )
}
