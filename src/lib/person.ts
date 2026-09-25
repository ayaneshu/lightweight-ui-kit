/**
 * A display name from an address or a name: "sara.k@acme.com" → "Sara K".
 * Anything without an @ is treated as a name already and title-cased by word.
 */
export function personName(emailOrName: string): string {
  const local = emailOrName.includes('@') ? (emailOrName.split('@')[0] ?? '') : emailOrName
  const words = local
    .split(/[\s._+-]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
  return words.join(' ') || 'Someone'
}

/** Up to two letters for an avatar circle. */
export function personInitials(emailOrName: string): string {
  const words = personName(emailOrName).split(' ')
  return ((words[0]?.[0] ?? '') + (words[1]?.[0] ?? '')).toUpperCase()
}

/**
 * Avatar fills, each carrying white initials at 4.5:1 or better. Solid rather than
 * tinted: stacks sit over thumbnails, and a pale chip vanishes on a bright one.
 */
export const AVATAR_COLORS = [
  '#4F46E5', // indigo
  '#E11D48', // rose
  '#0081A2', // cyan — darkened from #0891B2 so white initials clear 4.5:1
  '#B45309', // amber
  '#7C3AED', // violet
  '#00875B', // emerald — from #059669, same reason
  '#DB2777', // pink
  '#00857A', // teal — from #0D9488, same reason
] as const

/**
 * A person's colour, hashed from their address so it's the same on every card
 * and every render — you come to recognise a teammate by their circle, which
 * only works if it never changes. (Random would also break hydration.)
 */
export function personColor(key: string): string {
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

/** "3m ago" style relative time. */
export function timeAgo(date: string | number | Date | null | undefined): string {
  if (date == null) return 'never'
  const t = new Date(date).getTime()
  const s = Math.max(1, Math.floor((Date.now() - t) / 1000))
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(t).toLocaleDateString()
}
