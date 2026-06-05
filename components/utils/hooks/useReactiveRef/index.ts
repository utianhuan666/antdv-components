import useForceRender from '../useForceRender'
import { useRefCallback } from '../useRefCallback'

export function useReactiveRef<T>(initialValue?: T | null) {
  const forceRender = useForceRender()
  return useRefCallback(forceRender as any, initialValue)
}
