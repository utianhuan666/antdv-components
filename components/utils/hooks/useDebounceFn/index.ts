import type { MaybeRefOrGetter } from 'vue'
import { onScopeDispose, toValue } from 'vue'
import { useRefFunction } from '../useRefFunction'

export function useDebounceFn<T extends any[], U = any>(
  fn: (...args: T) => Promise<any> | any,
  wait?: MaybeRefOrGetter<number | undefined>,
) {
  const callback = useRefFunction(fn)
  let timer: ReturnType<typeof setTimeout> | null = null

  const cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  const run = async (...args: T): Promise<U | undefined> => {
    const waitTime = toValue(wait)
    if (waitTime === 0 || waitTime === undefined)
      return callback(...args)
    cancel()
    return new Promise<U>((resolve, reject) => {
      timer = setTimeout(async () => {
        try {
          resolve(await callback(...args))
        }
        catch (error) {
          reject(error)
        }
      }, waitTime)
    })
  }

  onScopeDispose(cancel)
  return { run, cancel }
}
