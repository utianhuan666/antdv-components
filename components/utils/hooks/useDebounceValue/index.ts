import type { Ref } from 'vue'
import { isRef, onScopeDispose, ref, watch } from 'vue'

/**
 * 一个去抖的setState 减少更新的频率
 * @param  {T | Ref<T>} value
 * @param  {number} [delay]
 * @param  {any[]} [deps]
 * @returns Ref<T>
 */
export function useDebounceValue<T>(
  value: T | Ref<T>,
  delay: number = 100,
  deps?: any[],
) {
  const readValue = () => {
    if (isRef(value))
      return value.value
    if (typeof value === 'function')
      return (value as () => T)()
    return value
  }
  const debouncedValue = ref(readValue()) as Ref<T>
  let timer: ReturnType<typeof setTimeout> | null = null

  const clear = () => {
    if (timer)
      clearTimeout(timer)
    timer = null
  }

  watch(
    () => deps ? deps.map(item => (isRef(item) ? item.value : item)) : readValue(),
    () => {
      clear()
      timer = setTimeout(() => {
        debouncedValue.value = readValue()
      }, delay)
    },
    { immediate: true, deep: true },
  )
  onScopeDispose(clear)
  return debouncedValue
}
