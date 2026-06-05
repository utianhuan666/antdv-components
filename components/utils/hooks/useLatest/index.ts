import type { ShallowRef } from 'vue'
import { shallowRef, watchEffect } from 'vue'

export function useLatest<T>(value: T): ShallowRef<T> {
  const ref = shallowRef(value) as ShallowRef<T>
  watchEffect(() => {
    ref.value = value
  })
  return ref
}
