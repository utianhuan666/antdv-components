export function runFunction<T extends any[]>(value: any, ...rest: T) {
  if (typeof value === 'function')
    return value(...rest)
  return value
}
