let index = 0

function genNanoid(size = 21) {
  if (typeof window === 'undefined' || !window.crypto)
    return (index += 1).toFixed(0)

  let id = ''
  const bytes = window.crypto.getRandomValues(new Uint8Array(size))
  for (; size--;) {
    const value = (bytes[size] ?? 0) & 63
    id += value < 36
      ? value.toString(36)
      : value < 62
        ? (value - 26).toString(36).toUpperCase()
        : value < 63
          ? '_'
          : '-'
  }
  return id
}

export function nanoid(): string {
  if (typeof window === 'undefined')
    return genNanoid()
  if (window.crypto && typeof window.crypto.randomUUID === 'function')
    return window.crypto.randomUUID()
  return genNanoid()
}
