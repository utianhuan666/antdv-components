import { shallowRef, watchEffect } from 'vue'

export function useLatest<T>(value: T) {
  const ref = shallowRef(value)
  watchEffect(() => {
    ref.value = value
  })
  return ref
}
