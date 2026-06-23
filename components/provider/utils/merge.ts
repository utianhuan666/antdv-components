export function shallowMergeOneLevel<T extends Record<string, any>>(...sources: any[]): T {
  const result = {} as Record<string, any>

  for (const source of sources) {
    if (!source)
      continue

    for (const key in source) {
      if (!Object.prototype.hasOwnProperty.call(source, key))
        continue
      const prev = result[key]
      const next = source[key]
      const canMerge
        = typeof prev === 'object'
          && typeof next === 'object'
          && prev !== null
          && next !== null
          && !Array.isArray(prev)
          && !Array.isArray(next)

      result[key] = canMerge ? { ...prev, ...next } : next
    }
  }

  return result as T
}

export const merge = shallowMergeOneLevel
