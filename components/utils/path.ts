export type PathKey = string | number

export function parseDotPath(dotPath: string): PathKey[] {
  return dotPath.split('.').map(segment => (/^\d+$/.test(segment) ? Number.parseInt(segment, 10) : segment))
}

export function getValue(source: any, path: PathKey[] | PathKey): any {
  const pathList = Array.isArray(path) ? path : [path]
  return pathList.reduce<any>((current, key) => current?.[key], source)
}

export function setValue(source: any, path: PathKey[], value: any): any {
  if (!path.length)
    return value
  let cursor = source
  path.slice(0, -1).forEach((key, index) => {
    const nextKey = path[index + 1]
    if (cursor[key] == null || typeof cursor[key] !== 'object')
      cursor[key] = typeof nextKey === 'number' ? [] : {}
    cursor = cursor[key]
  })
  const lastKey = path[path.length - 1]
  if (lastKey !== undefined)
    cursor[lastKey] = value
  return source
}

export function cloneDeep<T>(source: T, seen = new WeakMap<object, any>()): T {
  if (source == null || typeof source !== 'object')
    return source
  if (
    (source as any).$isDayjsObject === true
    || ((source as any)._isAMomentObject)
    || (typeof (source as any).clone === 'function' && typeof (source as any).isValid === 'function')
  ) {
    return typeof (source as any).clone === 'function' ? (source as any).clone() : source
  }
  if (source instanceof Date)
    return new Date(source.getTime()) as T
  if (source instanceof Map)
    return new Map(Array.from(source.entries()).map(([key, value]) => [cloneDeep(key, seen), cloneDeep(value, seen)])) as T
  if (source instanceof Set)
    return new Set(Array.from(source.values()).map(value => cloneDeep(value, seen))) as T
  if (source instanceof Blob)
    return source
  if (Array.isArray(source)) {
    if (seen.has(source))
      return seen.get(source)
    const result: any[] = []
    seen.set(source, result)
    source.forEach((item, index) => {
      result[index] = cloneDeep(item, seen)
    })
    return result as T
  }
  if (seen.has(source as object))
    return seen.get(source as object)
  const result = {} as Record<string, any>
  seen.set(source as object, result)
  Object.keys(source as Record<string, any>).forEach((key) => {
    result[key] = cloneDeep((source as Record<string, any>)[key], seen)
  })
  return result as T
}

export function isPlainObject(value: unknown): value is Record<string, any> {
  if (value === null)
    return true
  if (!value || typeof value !== 'object')
    return false
  if (Array.isArray(value))
    return false
  if (value instanceof Map || value instanceof Set || value instanceof RegExp)
    return false
  if (typeof HTMLElement !== 'undefined' && value instanceof HTMLElement)
    return false
  if (typeof Blob !== 'undefined' && value instanceof Blob)
    return false
  if (typeof File !== 'undefined' && value instanceof File)
    return false
  return Object.prototype.toString.call(value) === '[object Object]'
}
