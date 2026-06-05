import type { WatchStopHandle } from 'vue'
import { watch } from 'vue'
import { isDeepEqualReact } from '../../isDeepEqualReact'
import { useDebounceFn } from '../useDebounceFn'

export function isDeepEqual(a: any, b: any, ignoreKeys?: string[]) {
  return isDeepEqualReact(a, b, ignoreKeys)
}

export function useDeepCompareMemoize<T>(value: T, ignoreKeys?: string[]) {
  let memoized = value
  return () => {
    if (!isDeepEqual(value, memoized, ignoreKeys))
      memoized = value
    return memoized
  }
}

export function useDeepCompareEffect(
  effect: () => void | (() => void),
  dependencies: any[],
  ignoreKeys?: string[],
): WatchStopHandle {
  let previous: any[] | undefined
  return watch(
    () => dependencies,
    (_next, _old, onCleanup) => {
      if (previous && isDeepEqual(previous, dependencies, ignoreKeys))
        return
      previous = dependencies
      const cleanup = effect()
      if (typeof cleanup === 'function')
        onCleanup(cleanup)
    },
    { immediate: true, deep: true },
  )
}

export function useDeepCompareEffectDebounce(
  effect: () => void,
  dependencies: any[],
  ignoreKeys?: string[],
  waitTime?: number,
) {
  const effectDn = useDebounceFn(async () => {
    effect()
  }, waitTime || 16)
  return useDeepCompareEffect(() => {
    effectDn.run()
  }, dependencies, ignoreKeys)
}
