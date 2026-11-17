/**
 * What to call the person on screen.
 *
 * The account's name is optional -- registration takes an email and a password,
 * and the backend signs in by email -- so reading `user.name` straight out left
 * the side rail with a blank line and no initials, and greeted people with a
 * bare "¡Hola!".
 *
 * The part before the @ is the next best thing: it is what they chose, it is
 * short, and they recognise it. The full address is not, and it is also the one
 * piece of the account worth not painting across the screen.
 */
export function displayName(person: { name?: string | null; email?: string | null }): string {
  const name = person.name?.trim()
  if (name) return name
  const local = person.email?.trim().split('@')[0] ?? ''
  return local || 'Tu cuenta'
}

/** Just the first word of it, for a greeting that should not read like a form. */
export function firstNameOf(person: { name?: string | null; email?: string | null }): string {
  return displayName(person).split(/\s+/)[0]
}

/** Up to two letters for the avatar, from whatever displayName settled on. */
export function initialsOf(person: { name?: string | null; email?: string | null }): string {
  return displayName(person)
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
