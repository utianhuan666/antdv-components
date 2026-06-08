import type { WatchStopHandle } from 'vue'
import { isRef, onScopeDispose, toRaw, watch } from 'vue'
import { isDeepEqualReact } from '../../isDeepEqualReact'
import { useDebounceFn } from '../useDebounceFn'

export function isDeepEqual(a: any, b: any, ignoreKeys?: string[]) {
  return isDeepEqualReact(a, b, ignoreKeys)
}

function readDependency(value: any): any {
  if (isRef(value))
    return value.value
  // 支持 getter 形式的依赖（() => reactiveValue）：在 watch source 中调用以建立响应式追踪。
  // 这样 useFetchData / Table 等以 `[() => state.value]` 传入的依赖才能正确触发。
  if (typeof value === 'function')
    return (value as () => any)()
  return value
}

function readDependencies(dependencies: any[] | undefined): any[] {
  return (dependencies || []).map(readDependency)
}

function cloneComparable<T>(value: T, seen = new WeakMap<object, any>()): T {
  const rawValue = isRef(value) ? value.value : toRaw(value as any)
  if (rawValue === null || typeof rawValue !== 'object')
    return rawValue

  if (seen.has(rawValue))
    return seen.get(rawValue)

  if (rawValue instanceof Date)
    return new Date(rawValue.getTime()) as T

  if (rawValue instanceof RegExp)
    return new RegExp(rawValue.source, rawValue.flags) as T

  if (Array.isArray(rawValue)) {
    const cloned: any[] = []
    seen.set(rawValue, cloned)
    rawValue.forEach(item => cloned.push(cloneComparable(item, seen)))
    return cloned as T
  }

  if (rawValue instanceof Map) {
    const cloned = new Map()
    seen.set(rawValue, cloned)
    rawValue.forEach((mapValue, mapKey) => {
      cloned.set(cloneComparable(mapKey, seen), cloneComparable(mapValue, seen))
    })
    return cloned as T
  }

  if (rawValue instanceof Set) {
    const cloned = new Set()
    seen.set(rawValue, cloned)
    rawValue.forEach(item => cloned.add(cloneComparable(item, seen)))
    return cloned as T
  }

  const cloned: Record<string, any> = {}
  seen.set(rawValue, cloned)
  Object.keys(rawValue).forEach((key) => {
    cloned[key] = cloneComparable((rawValue as Record<string, any>)[key], seen)
  })
  return cloned as T
}

export function useDeepCompareMemoize<T>(value: T, ignoreKeys?: string[]) {
  let memoized = readDependency(value)
  let snapshot = cloneComparable(memoized)
  return () => {
    const nextValue = readDependency(value)
    if (!isDeepEqual(nextValue, snapshot, ignoreKeys)) {
      memoized = nextValue
      snapshot = cloneComparable(nextValue)
    }
    return memoized
  }
}

export function useDeepCompareEffect(
  effect: () => void | (() => void),
  dependencies: any[],
  ignoreKeys?: string[],
): WatchStopHandle {
  let previous = cloneComparable(readDependencies(dependencies))
  let initialized = false
  let cleanup: void | (() => void)
  let disposed = false

  const stop = watch(
    () => readDependencies(dependencies),
    (next) => {
      if (initialized && isDeepEqual(next, previous, ignoreKeys))
        return

      if (initialized)
        cleanup?.()

      initialized = true
      previous = cloneComparable(next)
      cleanup = effect() || undefined
    },
    { immediate: true, deep: true },
  )

  const stopWithCleanup = () => {
    if (disposed)
      return
    disposed = true
    stop()
    cleanup?.()
  }

  onScopeDispose(stopWithCleanup)
  return stopWithCleanup
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
