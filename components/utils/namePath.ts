export type PathKey = string | number
export type NamePathLike = PathKey | PathKey[]

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

export function normalizeNamePath(name: NamePathLike): PathKey[]
export function normalizeNamePath(name: NamePathLike | null | undefined): PathKey[] | undefined
export function normalizeNamePath(name: NamePathLike | null | undefined): PathKey[] | undefined {
  if (name === undefined || name === null)
    return undefined
  return Array.isArray(name) ? name : [name]
}

export function getValueByNamePath(source: any, name: NamePathLike | null | undefined): any {
  const path = normalizeNamePath(name)
  if (!path)
    return undefined
  return getValue(source, path)
}

export function setValueByNamePath(source: any, name: NamePathLike | null | undefined, value: any): any {
  const path = normalizeNamePath(name)
  if (!path || source == null)
    return source
  if (!path.length) {
    if (Array.isArray(source)) {
      source.splice(0, source.length, ...(Array.isArray(value) ? value : []))
      return source
    }
    if (source && typeof source === 'object') {
      Object.keys(source).forEach(key => delete source[key])
      Object.assign(source, value || {})
    }
    return source
  }
  return setValue(source, path, value)
}

export function deleteValueByNamePath(source: any, name: NamePathLike | null | undefined): void {
  const path = normalizeNamePath(name)
  if (!path?.length || source == null)
    return

  const lastKey = path[path.length - 1]
  if (lastKey === undefined)
    return
  const parent = path.slice(0, -1).reduce<any>((current, key) => {
    return current && typeof current === 'object' ? current[key] : undefined
  }, source)

  if (parent && typeof parent === 'object')
    delete parent[lastKey]
}

export function namePathKey(name: NamePathLike): string {
  return JSON.stringify(normalizeNamePath(name) || [])
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
