export function isUrl(path: string | undefined): boolean {
  if (!path || !path.startsWith('http'))
    return false
  try {
    return Boolean(new URL(path))
  }
  catch {
    return false
  }
}
