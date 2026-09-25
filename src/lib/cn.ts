export type ClassValue = string | number | bigint | boolean | null | undefined

/** Joins class names, skipping anything falsy (and `true`, from `cond && 'x'` misfires). */
export function cn(...classes: ClassValue[]): string {
  let out = ''
  for (const c of classes) {
    if (!c || c === true) continue
    out = out ? `${out} ${c}` : String(c)
  }
  return out
}
