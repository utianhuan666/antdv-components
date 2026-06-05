type Callback<T> = (currentRef: T) => void

export function useRefCallback<T>(
  callback: Callback<{ current: T | null | undefined }>,
  initialValue?: T | null,
) {
  const target = { current: initialValue }
  const proxy = new Proxy(target, {
    set(obj, prop, newValue) {
      if (!Object.is((obj as any)[prop], newValue)) {
        ;(obj as any)[prop] = newValue
        callback(proxy)
      }
      return true
    },
  }) as typeof target
  return proxy
}
