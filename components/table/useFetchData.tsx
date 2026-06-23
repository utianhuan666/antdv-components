import type { PageInfo, RequestData, UseFetchDataAction } from './typing'
import { computed, onScopeDispose, ref, shallowRef, unref, watch } from 'vue'
import { stableStringify } from '../utils'
import { postDataPipeline } from './utils'

export interface UseFetchProps<T = any> {
  dataSource?: T[]
  loading?: boolean | Record<string, any>
  onLoadingChange?: (loading: boolean) => void
  onLoad?: (dataSource: T[], extra?: Record<string, any>) => void
  onDataSourceChange?: (dataSource: T[] | undefined) => void
  postData?: (dataSource: T[]) => T[]
  pageInfo: { current?: number, pageSize?: number, defaultCurrent?: number, defaultPageSize?: number } | false
  onPageInfoChange?: (pageInfo: PageInfo) => void
  effects?: unknown[]
  onRequestError?: (e: Error) => void
  manual: boolean
  debounceTime?: number
  polling?: number | boolean | ((dataSource: T[]) => number | boolean | undefined)
  revalidateOnFocus?: boolean
}

const MIN_POLLING_INTERVAL_MS = 2000

function resolveControlledRef<T>(getter: () => T | undefined, setter: (value: T | undefined) => void, initial: T) {
  const inner = shallowRef<T | undefined>(getter() ?? initial)
  watch(getter, (value) => {
    if (value !== undefined)
      inner.value = value as T
  })
  return {
    get value() {
      return getter() ?? inner.value
    },
    set value(value: T | undefined) {
      if (getter() === undefined)
        inner.value = value
      queueMicrotask(() => setter(value))
    },
  }
}

export function setActionRef<T>(target: unknown, value: T) {
  if (!target)
    return
  if (typeof target === 'function') {
    target(value)
    return
  }
  if (typeof target === 'object' && 'value' in target) {
    ;(target as { value?: T }).value = value
    return
  }
  ;(target as { current?: T }).current = value
}

function mergeOptionAndPageInfo(options: UseFetchProps): PageInfo {
  const optionPageInfo = options.pageInfo
  if (optionPageInfo) {
    const { current, defaultCurrent, pageSize, defaultPageSize } = optionPageInfo
    return {
      current: current ?? defaultCurrent ?? 1,
      total: 0,
      pageSize: pageSize ?? defaultPageSize ?? 20,
    }
  }
  return { current: 1, total: 0, pageSize: 20 }
}

function resolvePolling<T>(polling: UseFetchProps<T>['polling'], dataSource: T[]) {
  const value = typeof polling === 'function' ? polling(dataSource) : polling
  if (value === true)
    return MIN_POLLING_INTERVAL_MS
  if (!value)
    return false
  return Math.max(Number(value), MIN_POLLING_INTERVAL_MS)
}

export default function useFetchData<T extends Record<string, any>>(
  getData: undefined | ((params?: { pageSize: number, current: number }) => Promise<RequestData<T> | null | undefined>),
  defaultData: T[] | undefined,
  options: UseFetchProps<T>,
): UseFetchDataAction<T> {
  const unmountedRef = ref(false)
  const manualRequestRef = ref(Boolean(options.manual))
  const abortRef = shallowRef<AbortController | null>(null)
  const pollingTimerRef = shallowRef<ReturnType<typeof setTimeout> | null>(null)
  const debounceTimerRef = shallowRef<ReturnType<typeof setTimeout> | null>(null)
  const requestSeq = ref(0)

  const pageInfo = ref<PageInfo>(mergeOptionAndPageInfo(options))
  // 与 React 一致：内部 tableDataList 初值为 defaultData（未传时为 undefined），
  // 而非 `[]`。Table 的 params effect 用 `action.dataSource && !isEqual(...)` 判定
  // 「是否已经请求过数据」，若初值就是 `[]`（truthy）会在首次挂载、数据尚未返回时
  // 误判为已加载，从而把 current 重置成 1，吞掉 defaultCurrent（见 base use 测试）。
  const dataSource = resolveControlledRef(
    () => options.dataSource,
    value => options.onDataSourceChange?.(value),
    defaultData as T[],
  )

  const controlledLoading = computed(() => {
    const loading = options.loading
    return typeof loading === 'object' ? Boolean((loading as any).spinning) : loading
  })
  const tableLoading = ref(Boolean(controlledLoading.value))
  const pollingLoading = ref(false)

  watch(controlledLoading, (value) => {
    if (value !== undefined)
      tableLoading.value = Boolean(value)
  })

  function setTableLoading(value: boolean) {
    if (controlledLoading.value === undefined)
      tableLoading.value = value
    queueMicrotask(() => options.onLoadingChange?.(value))
  }

  function requestFinally() {
    setTableLoading(false)
    pollingLoading.value = false
  }

  function clearPollingTimer() {
    if (pollingTimerRef.value) {
      clearTimeout(pollingTimerRef.value)
      pollingTimerRef.value = null
    }
  }

  function cancelDebounceTimer() {
    if (debounceTimerRef.value) {
      clearTimeout(debounceTimerRef.value)
      debounceTimerRef.value = null
    }
  }

  function abortFetch() {
    abortRef.value?.abort()
    cancelDebounceTimer()
    clearPollingTimer()
    requestFinally()
  }

  function setPageInfoInner(info: Partial<PageInfo>) {
    const nextPageInfo = { ...pageInfo.value, ...info } as PageInfo
    if (
      nextPageInfo.current === pageInfo.value.current
      && nextPageInfo.pageSize === pageInfo.value.pageSize
      && nextPageInfo.total === pageInfo.value.total
    ) {
      return
    }
    pageInfo.value = nextPageInfo
    options.onPageInfoChange?.(nextPageInfo)
  }

  async function fetchList(isPolling: boolean, signal?: AbortSignal) {
    if (manualRequestRef.value) {
      manualRequestRef.value = false
      return []
    }

    if (!isPolling)
      setTableLoading(true)
    else
      pollingLoading.value = true

    const { current, pageSize } = pageInfo.value
    try {
      const pageParams = options.pageInfo !== false
        ? { current, pageSize }
        : undefined
      const response = await getData?.(pageParams)
      if (signal?.aborted || unmountedRef.value)
        return []
      if (response?.success === false)
        return []

      const {
        data = [],
        total = 0,
        success: _success,
        ...extra
      } = response || {}
      const nextData = postDataPipeline<T[]>(data as T[], [options.postData].filter(Boolean) as any) || []

      if (signal?.aborted || unmountedRef.value)
        return []

      dataSource.value = nextData
      if (pageInfo.value.total !== (total || nextData.length)) {
        setPageInfoInner({
          total: total || nextData.length,
        })
      }
      else {
        options.onPageInfoChange?.(pageInfo.value)
      }
      options.onLoad?.(nextData, extra)
      return nextData
    }
    catch (e) {
      if (signal?.aborted || unmountedRef.value)
        return []
      const requestError = e instanceof Error ? e : new Error(String(e))
      if (options.onRequestError === undefined)
        throw requestError
      if (dataSource.value === undefined)
        dataSource.value = []
      options.onRequestError(requestError)
      return []
    }
    finally {
      if (!signal?.aborted && !unmountedRef.value)
        requestFinally()
    }
  }

  async function runFetch(isPolling: boolean) {
    clearPollingTimer()
    if (!getData)
      return []

    const requestId = ++requestSeq.value
    const abort = new AbortController()
    abortRef.value = abort

    try {
      const result = await Promise.race([
        fetchList(isPolling, abort.signal),
        new Promise<[]>(resolve => abort.signal.addEventListener('abort', () => {
          requestFinally()
          resolve([])
        }, { once: true })),
      ])

      if (abort.signal.aborted || unmountedRef.value || requestId !== requestSeq.value)
        return []

      const nextPolling = resolvePolling(options.polling, result as T[])
      if (nextPolling && !unmountedRef.value) {
        pollingTimerRef.value = setTimeout(() => {
          void runFetch(true)
        }, nextPolling)
      }

      return result as T[]
    }
    catch (error) {
      if (abort.signal.aborted)
        return []
      throw error
    }
  }

  function runFetchDebounced(isPolling = false) {
    cancelDebounceTimer()
    const wait = options.debounceTime ?? 20
    if (wait === 0)
      return runFetch(isPolling)
    return new Promise<T[]>((resolve, reject) => {
      debounceTimerRef.value = setTimeout(() => {
        runFetch(isPolling).then(resolve).catch(reject)
      }, wait)
    })
  }

  watch(
    () => options.polling,
    (polling, previousPolling) => {
      if (!polling) {
        clearPollingTimer()
        return
      }
      if (!previousPolling)
        void runFetchDebounced(true)
    },
  )

  watch(
    () => options.pageInfo,
    (optionPageInfo) => {
      if (!optionPageInfo)
        return
      const nextCurrent = optionPageInfo.current
      const nextPageSize = optionPageInfo.pageSize
      if (nextCurrent !== undefined || nextPageSize !== undefined) {
        setPageInfoInner({
          current: nextCurrent ?? pageInfo.value.current,
          pageSize: nextPageSize ?? pageInfo.value.pageSize,
        })
      }
    },
    { deep: true },
  )

  watch(
    () => [pageInfo.value.current, pageInfo.value.pageSize] as const,
    ([current, pageSize], [preCurrent, prePageSize]) => {
      if ((!preCurrent || preCurrent === current) && (!prePageSize || prePageSize === pageSize))
        return
      if (options.pageInfo && dataSource.value && dataSource.value.length > pageSize)
        return
      if (current !== undefined && dataSource.value && dataSource.value.length <= pageSize) {
        abortFetch()
        void runFetchDebounced(false)
      }
    },
  )

  const effectsKey = computed(() => stableStringify((options.effects || []).map(item => (typeof item === 'function' ? (item as any)() : unref(item as any)))))

  watch(
    () => [effectsKey.value, options.manual] as const,
    ([, manual]) => {
      manualRequestRef.value = Boolean(manual)
      abortFetch()
      void runFetchDebounced(false)
      if (!manual)
        manualRequestRef.value = false
    },
    { immediate: true },
  )

  function revalidate() {
    if (!options.revalidateOnFocus || !getData || options.manual)
      return
    void runFetchDebounced(false)
  }

  function onVisibilityChange() {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible')
      revalidate()
  }

  if (typeof window !== 'undefined')
    window.addEventListener('focus', revalidate)
  if (typeof document !== 'undefined')
    document.addEventListener('visibilitychange', onVisibilityChange)

  onScopeDispose(() => {
    unmountedRef.value = true
    abortFetch()
    if (typeof window !== 'undefined')
      window.removeEventListener('focus', revalidate)
    if (typeof document !== 'undefined')
      document.removeEventListener('visibilitychange', onVisibilityChange)
  })

  return {
    get dataSource() {
      // 与 React 一致：返回原始值（未加载时为 undefined），不强制 `|| []`。
      // Table 的 params effect 依赖 `action.dataSource` 为 undefined 来判定「尚未请求过」，
      // 若强制成 `[]` 会在首次挂载误判已加载并把 current 重置为 1（见 base use 测试）。
      // 所有消费方均已用 `?.length` / `|| []` 兜底。
      return dataSource.value
    },
    setDataSource(value) {
      dataSource.value = typeof value === 'function' ? value(dataSource.value || []) : value
    },
    get loading() {
      if (typeof options.loading === 'object')
        return { ...(options.loading as any), spinning: tableLoading.value }
      return tableLoading.value
    },
    get pageInfo() {
      return pageInfo.value
    },
    reload: async () => {
      abortFetch()
      manualRequestRef.value = false
      await runFetchDebounced(false)
    },
    reset: async () => {
      const optionPageInfo = options.pageInfo || {}
      const { defaultCurrent = 1, defaultPageSize = 20 } = optionPageInfo as any
      setPageInfoInner({
        current: defaultCurrent,
        total: 0,
        pageSize: defaultPageSize,
      })
    },
    get pollingLoading() {
      return pollingLoading.value
    },
    setPageInfo: async (info) => {
      setPageInfoInner(info)
    },
  }
}
