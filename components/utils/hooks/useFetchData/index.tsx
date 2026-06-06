import type { Ref } from 'vue'
import { isRef, onScopeDispose, ref, shallowRef, watch } from 'vue'

let testId = 0
const fetchDataCache = new Map<string, unknown>()

export type ProRequestData<T, U = Record<string, any>> = (
  params: U,
  props: any,
) => Promise<T>

export function useFetchData<T, U = Record<string, any>>(props: {
  proFieldKey?: string | number
  params?: U | Ref<U>
  request?: ProRequestData<T, U>
}): [Ref<T | undefined>, Ref<boolean>] {
  const cacheKey = props.proFieldKey ? props.proFieldKey.toString() : String(++testId)
  const data = shallowRef<T | undefined>(fetchDataCache.get(cacheKey) as T | undefined)
  const loading = ref(false)
  let abort: AbortController | null = null

  const getParams = () => isRef(props.params) ? props.params.value : props.params

  async function fetchData() {
    abort?.abort()
    if (!props.request) {
      data.value = undefined
      loading.value = false
      return
    }

    abort = new AbortController()
    const currentAbort = abort
    loading.value = true
    try {
      const response = await props.request(getParams() as U, currentAbort.signal)
      if (!currentAbort.signal.aborted) {
        data.value = response
        fetchDataCache.set(cacheKey, response)
      }
    }
    catch (error: any) {
      if (error?.name !== 'AbortError' && !currentAbort.signal.aborted)
        throw error
    }
    finally {
      if (abort === currentAbort)
        loading.value = false
    }
  }

  watch(
    () => [props.request, cacheKey, getParams()],
    fetchData,
    { immediate: true, deep: true },
  )
  onScopeDispose(() => abort?.abort())
  return [data, loading]
}
