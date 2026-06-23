import type { Ref } from 'vue'
import { isRef, shallowRef, watchEffect } from 'vue'

function readLatestValue(value: unknown): unknown {
  return isRef(value) ? value.value : value
}

export function useLatest<T>(value: T): { readonly current: T extends Ref<infer V> ? V : T } {
  const latest = shallowRef<any>(readLatestValue(value))
  watchEffect(() => {
    latest.value = readLatestValue(value)
  })
  return {
    get current() {
      return latest.value
    },
  }
}
