import { reactive } from 'vue'

export function useReactiveRef<T>(initialValue?: T | null) {
  return reactive({
    current: initialValue,
  }) as { current: T | null | undefined }
}
