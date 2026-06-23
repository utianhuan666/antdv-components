import type { ShallowRef } from 'vue'
import { isRef, shallowRef, watch } from 'vue'
import { cloneComparable, isDeepEqual } from '../useDeepCompareEffect'

function readDependency(value: any): any {
  return isRef(value) ? value.value : value
}

function readDependencies(dependencies: any[] | undefined): any[] {
  return (dependencies || []).map(readDependency)
}

/**
 * `useDeepCompareMemo` will only recompute the memoized value when one of the
 * `deps` has changed.
 *
 * Usage note: only use this if `deps` are objects or arrays that contain
 * objects. Otherwise you should just use `computed`.
 *
 */
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
