import { shallowRef, watch } from 'vue'

export function usePrevious<T>(state: () => T) {
  const previous = shallowRef<T>()
  watch(state, (_next, oldValue) => {
    previous.value = oldValue
  })
  return previous
}
