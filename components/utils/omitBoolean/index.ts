export function omitBoolean<T>(obj: boolean | T): T | undefined {
  if (obj && obj !== true)
    return obj as T
  return undefined
}
