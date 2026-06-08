import type { Ref } from 'vue'
import type { PageInfo, UseFetchProps } from '../typing'
import { ref } from 'vue'
import { useRefFunction } from '../../utils'

/**
 * 组合用户的配置和默认值
 *
 * @param param0
 */
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

/**
 * 专门用于处理分页信息更新的 Hook
 * 解决了 total 缺失导致的死循环问题
 */
export function usePageInfo(options: UseFetchProps): readonly [Ref<PageInfo>, (changePageInfo: Partial<PageInfo>) => void] {
  const pageInfo = ref<PageInfo>(mergeOptionAndPageInfo(options))

  const setPageInfoState = useRefFunction(
    (updater: PageInfo | ((prev: PageInfo) => PageInfo)) => {
      const next
        = typeof updater === 'function'
          ? (updater as (p: PageInfo) => PageInfo)(pageInfo.value)
          : updater
      options?.onPageInfoChange?.(next)
      pageInfo.value = next
    },
  )

  const setPageInfo = useRefFunction((changePageInfo: Partial<PageInfo>) => {
    const newPageInfo = {
      ...pageInfo.value,
      ...changePageInfo,
    }

    if (
      newPageInfo.current !== pageInfo.value.current
      || newPageInfo.pageSize !== pageInfo.value.pageSize
      || newPageInfo.total !== pageInfo.value.total
    ) {
      setPageInfoState(newPageInfo as PageInfo)
    }
  })

  return [pageInfo, setPageInfo] as const
}
