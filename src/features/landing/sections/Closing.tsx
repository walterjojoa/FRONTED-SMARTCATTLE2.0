import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { FoldedRibbon } from '../../../components/brand/FoldedRibbon'
import { BrandMark } from '../../../components/ui'
import { Reveal } from '../../../motion'
import styles from '../LandingPage.module.css'

export function Closing() {
  return (
    <>
      <section className={styles.closeBand} aria-labelledby="close-title">
        <div className={styles.closeRibbon}><FoldedRibbon parallax={false} /></div>
        <div className={`${styles.rail} ${styles.close}`}>
        <Reveal inView>
          <p className={styles.eyebrow}>Empieza hoy</p>
          <h2 id="close-title" className={styles.closeTitle}>Empieza con una cámara.</h2>
          <p className={styles.closeText}>Crea tu cuenta, conecta una cámara y mira a tu ganado en minutos.</p>
          <div className={styles.closeActions}>
            <Link className={styles.btnPrimary} to="/register">Crear cuenta<ArrowRight size={16} strokeWidth={2} aria-hidden="true" /></Link>
            <Link className={styles.btnOutline} to="/login">Ingresar</Link>
          </div>
        </Reveal>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.rail}>
          <BrandMark size="sm" tone="on-dark" />
          <div className={styles.footerCols}>
            <nav aria-label="Producto">
              <p className={styles.footerHead}>Producto</p>
              <a href="#funciones">Detección de ganado</a>
              <a href="#funciones">Zonas seguras</a>
              <a href="#funciones">Informe diario</a>
              <a href="#funciones">Asistente Lucero</a>
            </nav>
            <nav aria-label="Cómo funciona">
              <p className={styles.footerHead}>Cómo funciona</p>
              <a href="#como-funciona">Cámara</a>
              <a href="#como-funciona">Detección</a>
              <a href="#como-funciona">Alerta</a>
              <a href="#como-funciona">Revisión</a>
            </nav>
            <nav aria-label="Cuenta">
              <p className={styles.footerHead}>Cuenta</p>
              <Link to="/login">Ingresar</Link>
              <Link to="/register">Crear cuenta</Link>
            </nav>
            <div>
              <p className={styles.footerHead}>Aviso</p>
              <p className={styles.footerNote}>Las detecciones son estimaciones de visión por computadora.</p>
            </div>
          </div>
          <p className={styles.footerFine}>© 2026 SmartCattle · Monitoreo de fincas con cámaras e inteligencia artificial. No es un diagnóstico veterinario.</p>
        </div>
      </footer>
    </>
  )
}
