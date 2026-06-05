import { shallowRef } from 'vue'

function useRefFunction<T extends (...args: any[]) => any>(reFunction: T) {
  const ref = shallowRef<T>(reFunction)
  ref.value = reFunction
  return ((...rest: Parameters<T>): ReturnType<T> => ref.value?.(...rest)) as T
}

export { useRefFunction }
