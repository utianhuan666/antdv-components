import type { ShallowRef } from 'vue'
import { isRef, shallowRef, toRaw, watch } from 'vue'
import { isDeepEqual } from '../useDeepCompareEffect'

function readDependency(value: any): any {
  return isRef(value) ? value.value : value
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

function useDeepCompareMemo<T>(factory: () => T, dependencies: any[]): ShallowRef<T> {
  const memoized = shallowRef(factory())
  let previous = cloneComparable(readDependencies(dependencies))

  watch(
    () => readDependencies(dependencies),
    (next) => {
      if (isDeepEqual(next, previous))
        return
      previous = cloneComparable(next)
      memoized.value = factory()
    },
    { deep: true },
  )

  return memoized
}

export default useDeepCompareMemo
