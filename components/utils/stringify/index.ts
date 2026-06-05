export interface StringifyOptions {
  bigint?: boolean
  circularValue?: string
  deterministic?: boolean
  maximumDepth?: number
}

export function configure(options: StringifyOptions = {}) {
  const circularValue = options.circularValue ?? 'Magic circle!'
  const maximumDepth = options.maximumDepth ?? 4

  return function stringify(value: unknown) {
    const seen = new WeakSet<object>()
    return JSON.stringify(value, (_key, item) => {
      if (typeof item === 'bigint')
        return options.bigint === false ? undefined : Number(item)
      if (typeof item === 'function')
        return undefined
      if (item && typeof item === 'object') {
        if (seen.has(item))
          return circularValue
        seen.add(item)
        let depth = 1
        let parent = Object.getPrototypeOf(item)
        while (parent && typeof parent === 'object') {
          depth += 1
          parent = Object.getPrototypeOf(parent)
        }
        if (depth > maximumDepth)
          return '[Object]'
      }
      return item
    })
  }
}

const stringify = configure({
  bigint: true,
  circularValue: 'Magic circle!',
  deterministic: false,
  maximumDepth: 4,
})

export { stringify }
export default stringify
