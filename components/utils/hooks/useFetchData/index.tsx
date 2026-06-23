import type { Ref } from 'vue'
import useSWRV from 'swrv'
import { computed, isRef, onScopeDispose } from 'vue'
import { configure } from '../../stringify'

let testId = 0
const stringifyKey = configure({
  bigint: true,
  circularValue: '[Circular]',
  deterministic: true,
})

export type ProRequestData<T, U = Record<string, any>> = (
  params: U,
  props: any,
) => Promise<T>

export function useFetchData<T, U = Record<string, any>>(props: {
  proFieldKey?: string | number
  params?: U | Ref<U>
  request?: ProRequestData<T, U>
}): [Ref<T | undefined>, Ref<boolean>] {
  const cacheKey = (() => {
    if (props.proFieldKey)
      return props.proFieldKey.toString()
    testId += 1
    return testId.toString()
  })()
  let abort: AbortController | null = null
  const getParams = () => isRef(props.params) ? props.params.value : props.params
  const swrKey = computed(() => props.request ? `${cacheKey}::${stringifyKey(getParams())}` : null)

  const fetchData = async () => {
    abort?.abort()
    const currentAbort = new AbortController()
    abort = currentAbort
    try {
      if (!props.request)
        return undefined
      return await props.request(getParams() as U, currentAbort.signal)
    }
    catch (error: any) {
      if (error?.name === 'AbortError')
        return undefined
      throw error
    }
  }

  const { data, isValidating } = useSWRV<T | undefined>(
    swrKey,
    fetchData,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  )

  onScopeDispose(() => abort?.abort())
  return [data, isValidating]
}
