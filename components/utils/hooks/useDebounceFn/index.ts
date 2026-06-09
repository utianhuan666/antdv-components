import type { MaybeRefOrGetter } from 'vue'
import { onScopeDispose, toValue } from 'vue'
import { useRefFunction } from '../useRefFunction'

/**
 * 一个去抖的 hook，传入一个 function，返回一个去抖后的 function
 * @param  {(...args:T) => Promise<any>} fn
 * @param  {MaybeRefOrGetter<number | undefined>} [wait]
 */
export function useDebounceFn<T extends any[], U = any>(
  fn: (...args: T) => Promise<any>,
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

  const run = async (...args: any): Promise<U | undefined> => {
    const waitTime = toValue(wait)
    if (waitTime === 0 || waitTime === undefined) {
      return callback(...args)
    }
    cancel()
    return new Promise<U>((resolve) => {
      timer = setTimeout(async () => {
        resolve(await callback(...args))
      }, waitTime)
    })
  }

  onScopeDispose(cancel)
  return {
    run,
    cancel,
  }
}
