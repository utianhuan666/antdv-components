const isNode
  = typeof (globalThis as any).process !== 'undefined'
    && (globalThis as any).process.versions != null
    && (globalThis as any).process.versions.node != null

export function isBrowser() {
  const currentProcess = (globalThis as any).process
  if (currentProcess?.env?.NODE_ENV === 'TEST')
    return true
  return (
    typeof window !== 'undefined'
    && typeof window.document !== 'undefined'
    && typeof window.matchMedia !== 'undefined'
    && !isNode
  )
}
