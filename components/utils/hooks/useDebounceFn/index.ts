import { onScopeDispose } from 'vue'
import { useRefFunction } from '../useRefFunction'

export function useDebounceFn<T extends any[], U = any>(
  fn: (...args: T) => Promise<any> | any,
  wait?: number,
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
    if (wait === 0 || wait === undefined)
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
      }, wait)
    })
  }

  onScopeDispose(cancel)
  return { run, cancel }
}
