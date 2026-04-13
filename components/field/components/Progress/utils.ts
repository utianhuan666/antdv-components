export function getProgressStatus(
  text: number,
): 'success' | 'exception' | 'normal' | 'active' {
  if (text === 100) {
    return 'success'
  }
  if (text < 0) {
    return 'exception'
  }
  if (text < 100) {
    return 'active'
  }
  return 'normal'
}

/** Convert a possibly-percent string like "85%" to a plain number. */
export function toNumber(text: string | number): number {
  if (typeof text === 'string' && text.includes('%')) {
    return Number(text.replace('%', ''))
  }
  return Number(text)
}
