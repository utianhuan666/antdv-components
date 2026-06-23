type OmitUndefined<T> = {
  [P in keyof T]: NonNullable<T[P]>
}

export function omitUndefined<T extends Record<string, any>>(obj: T): OmitUndefined<T> | undefined {
  const newObj = {} as Record<string, any>
  Object.keys(obj || {}).forEach((key) => {
    if (obj[key] !== undefined)
      newObj[key] = obj[key]
  })
  if (Object.keys(newObj).length < 1)
    return undefined
  return newObj as OmitUndefined<T>
}
