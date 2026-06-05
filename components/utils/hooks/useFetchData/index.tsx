import type { Ref } from 'vue'
import { onScopeDispose, ref, shallowRef, watch } from 'vue'

let testId = 0

export type ProRequestData<T, U = Record<string, any>> = (
  params: U,
  props: any,
) => Promise<T>

export function useFetchData<T, U = Record<string, any>>(props: {
  proFieldKey?: string | number
  params?: U | Ref<U>
  request?: ProRequestData<T, U>
}): [Ref<T | undefined>, Ref<boolean>] {
  const data = shallowRef<T>()
  const loading = ref(false)
  const cacheKey = props.proFieldKey?.toString() || String(++testId)
  let abort: AbortController | null = null

  async function fetchData() {
    abort?.abort()
    abort = new AbortController()
    if (!props.request) {
      data.value = undefined
      loading.value = false
      return
    }
    loading.value = true
    try {
      const params = (props.params && typeof props.params === 'object' && 'value' in props.params)
        ? (props.params as Ref<U>).value
        : props.params
      data.value = await props.request(params as U, abort.signal)
    }
    catch (error: any) {
      if (error?.name !== 'AbortError')
        throw error
    }
    finally {
      loading.value = false
    }
  }

  watch(
    () => [props.request, cacheKey, props.params && typeof props.params === 'object' && 'value' in props.params ? (props.params as Ref<U>).value : props.params],
    fetchData,
    { immediate: true, deep: true },
  )
  onScopeDispose(() => abort?.abort())
  return [data, loading]
}
