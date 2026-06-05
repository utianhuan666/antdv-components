import { computed } from 'vue'

function useDeepCompareMemo<T>(factory: () => T, _dependencies: any[]) {
  return computed(factory)
}

export default useDeepCompareMemo
