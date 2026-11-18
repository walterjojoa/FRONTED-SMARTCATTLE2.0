import { Sparkles } from 'lucide-react'
import styles from './AssistantMark.module.css'

/** The assistant's avatar: a round green badge. It turns slowly while a reply is on its way. */
export function AssistantMark({ size = 48, thinking = false }: { size?: number; thinking?: boolean }) {
  return (
    <span className={styles.mark} data-thinking={thinking || undefined} style={{ width: size, height: size }} aria-hidden="true">
      <Sparkles size={Math.round(size * 0.46)} strokeWidth={2} />
    </span>
  )
}
