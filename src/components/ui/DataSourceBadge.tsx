import { FlaskConical } from 'lucide-react'
import { dataMode } from '../../api/config'
import { tokenStore } from '../../api/session'
import styles from './DataSourceBadge.module.css'

/**
 * Says the figures on screen are invented, where they are.
 *
 * It used to ask the build (`dataMode !== 'api'`), which gives everyone the same
 * answer: in a hybrid deployment a real account, with real cameras and real
 * cattle, was told its own data was a demonstration.
 *
 * A token is what separates the two. Only a session that signed in against the
 * backend has one -- a demo session carries none, by design -- and what that
 * session is shown came from the backend, whatever the build is set to. Read
 * from the store rather than through useAuth so this stays a leaf component
 * that renders anywhere, including in a test that mounts a bar on its own.
 */
export function DataSourceBadge({ tone = 'default' }: { tone?: 'default' | 'on-brand' }) {
  const signedInForReal = tokenStore.get() !== null
  if (signedInForReal || dataMode === 'api') return null
  return <span className={`${styles.badge} ${tone === 'on-brand' ? styles.onBrand : ''}`}
    title="Parte de la información es simulada mientras el backend no la ofrezca.">
    <FlaskConical size={14} strokeWidth={1.75} aria-hidden="true" />
    <span>Datos de demostración</span>
  </span>
}
