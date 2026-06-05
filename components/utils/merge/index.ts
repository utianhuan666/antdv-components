export function merge<T = any>(...rest: any[]): T {
  const obj = {} as Record<string, any>
  for (const item of rest) {
    for (const key in item) {
      if (!Object.prototype.hasOwnProperty.call(item, key))
        continue
      if (
        typeof obj[key] === 'object'
        && typeof item[key] === 'object'
        && obj[key] !== undefined
        && obj[key] !== null
        && !Array.isArray(obj[key])
        && !Array.isArray(item[key])
      ) {
        obj[key] = { ...obj[key], ...item[key] }
      }
      else {
        obj[key] = item[key]
      }
    }
  }
  return obj as T
}
