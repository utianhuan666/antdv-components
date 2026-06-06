import { computed, nextTick, ref, shallowRef, unref, watch } from 'vue'

export interface ProDescriptionsRequestResult<T = unknown> {
  data?: T
  success?: boolean
  total?: number
}

export type RequestData<T = unknown> = ProDescriptionsRequestResult<T>

export interface UseProDescriptionsFetchAction<TData> {
  dataSource: TData | undefined
  setDataSource: (value: TData | undefined) => void
  loading?: boolean
  reload: () => Promise<void>
}

function isRefLike(value: unknown): value is { value: unknown } {
  return Boolean(value && typeof value === 'object' && 'value' in value)
}

export function setActionRef<T>(target: unknown, value: T) {
  if (!target)
    return
  if (isRefLike(target)) {
    target.value = value
    return
  }
  ;(target as { current?: T }).current = value
}

function useFetchData<
  TData,
  TResponse extends ProDescriptionsRequestResult<TData>,
>(
  getData: () => Promise<TResponse>,
  options?: {
    effectKey?: unknown
    manual: boolean
    loading?: boolean
    onLoadingChange?: (loading?: boolean) => void
    onRequestError?: (e: Error) => void
    dataSource?: TData
    defaultDataSource?: TData
    onDataSourceChange?: (value: TData | undefined) => void
  },
): UseProDescriptionsFetchAction<TData> {
  const entity = shallowRef<TData | undefined>(options?.dataSource ?? options?.defaultDataSource)
  const innerLoading = ref<boolean | undefined>(options?.loading)
  const fetching = ref(false)

  watch(
    () => options?.dataSource,
    value => (entity.value = value),
  )

  watch(
    () => options?.loading,
    value => (innerLoading.value = value),
  )

  const loading = computed(() => {
    if (options?.loading === false)
      return false
    return options?.loading ?? innerLoading.value
  })

  const setEntity = (value: TData | undefined) => {
    entity.value = value
    options?.onDataSourceChange?.(value)
  }

  const setLoading = (value: boolean | undefined) => {
    if (options?.loading === undefined)
      innerLoading.value = value
    queueMicrotask(() => {
      options?.onLoadingChange?.(value)
    })
  }

  const reload = async () => {
    if (fetching.value)
      return
    fetching.value = true
    setLoading(true)
    try {
      const { data, success } = (await getData()) || {}
      if (success !== false)
        setEntity(data)
    }
    catch (e) {
      const error = e instanceof Error ? e : new Error(String(e))
      if (options?.onRequestError)
        options.onRequestError(error)
      else
        throw error
    }
    finally {
      fetching.value = false
      setLoading(false)
    }
  }

  watch(
    () => [options?.manual, unref(options?.effectKey as any)] as const,
    ([manual]) => {
      if (manual)
        return
      nextTick(reload)
    },
    { immediate: true },
  )

  return {
    get dataSource() {
      return entity.value
    },
    setDataSource: setEntity,
    get loading() {
      return loading.value
    },
    reload,
  }
}

export default useFetchData
