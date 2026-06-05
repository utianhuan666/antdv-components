export function isDeepEqualReact(a: any, b: any, ignoreKeys?: string[]) {
  if (a === b)
    return true

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    if (a.constructor !== b.constructor)
      return false

    let length: number
    let i: any
    const keys: string[] = []
    if (Array.isArray(a)) {
      length = a.length
      if (length !== b.length)
        return false
      for (i = length; i-- !== 0;) {
        if (!isDeepEqualReact(a[i], b[i], ignoreKeys))
          return false
      }
      return true
    }

    if (a instanceof Map && b instanceof Map) {
      if (a.size !== b.size)
        return false
      for (i of a.entries()) {
        if (!b.has(i[0]))
          return false
      }
      for (i of a.entries()) {
        if (!isDeepEqualReact(i[1], b.get(i[0]), ignoreKeys))
          return false
      }
      return true
    }

    if (a instanceof Set && b instanceof Set) {
      if (a.size !== b.size)
        return false
      for (i of a.entries()) {
        if (!b.has(i[0]))
          return false
      }
      return true
    }

    if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
      length = (a as any).length
      if (length !== (b as any).length)
        return false
      for (i = length; i-- !== 0;) {
        if ((a as any)[i] !== (b as any)[i])
          return false
      }
      return true
    }

    if (a.constructor === RegExp)
      return a.source === b.source && a.flags === b.flags
    if (a.valueOf !== Object.prototype.valueOf && a.valueOf)
      return a.valueOf() === b.valueOf()
    if (a.toString !== Object.prototype.toString && a.toString)
      return a.toString() === b.toString()

    keys.push(...Object.keys(a))
    length = keys.length
    if (length !== Object.keys(b).length)
      return false

    for (i = length; i-- !== 0;) {
      const key = keys[i]
      if (key === undefined || !Object.prototype.hasOwnProperty.call(b, key))
        return false
    }

    for (i = length; i-- !== 0;) {
      const key = keys[i]
      if (key === undefined)
        continue
      if (ignoreKeys?.includes(key))
        continue
      if (key === '_owner' && a.$$typeof)
        continue
      if (!isDeepEqualReact(a[key], b[key], ignoreKeys))
        return false
    }
    return true
  }

  return Number.isNaN(a) && Number.isNaN(b)
}
