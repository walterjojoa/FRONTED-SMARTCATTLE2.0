import { useDocumentTitle } from '../../app/useDocumentTitle'
import { Bento } from './sections/Bento'
import { Closing } from './sections/Closing'
import { FarmMap } from './sections/FarmMap'
import { HeroReveal } from './sections/HeroReveal'
import { Mechanism } from './sections/Mechanism'
import { NavGlass } from './sections/NavGlass'
import { Proof } from './sections/Proof'
import styles from './LandingPage.module.css'

export function LandingPage() {
  useDocumentTitle()
  return (
    <div className={styles.page}>
      <NavGlass />
      <main>
        <HeroReveal />
        <FarmMap />
        <Bento />
        <Proof />
        <Mechanism />
        <Closing />
      </main>
    </div>
  )
}
