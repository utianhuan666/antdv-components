import type { PageInfo } from '../typing'
import type { UseFetchProps } from '../useFetchData'
import { ref, watch } from 'vue'

function mergeOptionAndPageInfo({ pageInfo }: UseFetchProps) {
  if (pageInfo) {
    const { current, defaultCurrent, pageSize, defaultPageSize } = pageInfo
    return {
      current: current || defaultCurrent || 1,
      total: 0,
      pageSize: pageSize || defaultPageSize || 20,
    }
  }
  return { current: 1, total: 0, pageSize: 20 }
}

export function usePageInfo(options: UseFetchProps) {
  const pageInfo = ref<PageInfo>(mergeOptionAndPageInfo(options))

  const setPageInfo = (changePageInfo: Partial<PageInfo>) => {
    const newPageInfo = {
      ...pageInfo.value,
      ...changePageInfo,
    }

    if (
      newPageInfo.current !== pageInfo.value.current
      || newPageInfo.pageSize !== pageInfo.value.pageSize
      || newPageInfo.total !== pageInfo.value.total
    ) {
      pageInfo.value = newPageInfo as PageInfo
      options?.onPageInfoChange?.(newPageInfo as PageInfo)
    }
  }

  watch(
    () => options.pageInfo,
    () => {
      if (options.pageInfo === false)
        return
      const next = mergeOptionAndPageInfo(options)
      setPageInfo(next)
    },
    { deep: true },
  )

  return [pageInfo, setPageInfo] as const
}
