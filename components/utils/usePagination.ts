import type { TablePaginationConfig } from 'antdv-next'
import { computed, reactive } from 'vue'

export type { TablePaginationConfig }

export const DEFAULT_PAGE_SIZE = 10

function extendsObject<T extends object>(base: Partial<T>, override: Partial<T>, extra: Partial<T> = {}): T {
  return { ...(base as object), ...(override as object), ...(extra as object) } as T
}

export function getPaginationParam(
  mergedPagination: TablePaginationConfig,
  pagination?: TablePaginationConfig | boolean,
) {
  const param: any = {
    current: mergedPagination.current,
    pageSize: mergedPagination.pageSize,
  }
  const paginationObj = pagination && typeof pagination === 'object' ? pagination : {}
  Object.keys(paginationObj).forEach((pageProp) => {
    const value = (mergedPagination as any)[pageProp]
    if (typeof value !== 'function')
      param[pageProp] = value
  })
  return param
}

function usePagination(
  total: number,
  onChange: (current: number, pageSize: number) => void,
  pagination?: TablePaginationConfig | false,
) {
  const paginationObj = pagination && typeof pagination === 'object' ? pagination : {}
  const innerPagination = reactive({
    current: 'defaultCurrent' in paginationObj ? paginationObj.defaultCurrent : 1,
    pageSize: 'defaultPageSize' in paginationObj ? paginationObj.defaultPageSize : DEFAULT_PAGE_SIZE,
  })

  const mergedPagination = computed<TablePaginationConfig>(() => {
    const { total: paginationTotal = 0, ...restPaginationObj } = paginationObj
    const merged = extendsObject<TablePaginationConfig>(innerPagination as any, restPaginationObj, {
      total: paginationTotal > 0 ? paginationTotal : total,
    })
    const pageSize = merged.pageSize || DEFAULT_PAGE_SIZE
    const maxPage = Math.ceil((paginationTotal || total) / pageSize)
    if ((merged.current || 1) > maxPage)
      merged.current = maxPage || 1
    return merged
  })

  const refreshPagination = (current?: number, pageSizeArg?: number) => {
    innerPagination.current = current ?? 1
    innerPagination.pageSize = pageSizeArg || mergedPagination.value.pageSize
  }

  const onInternalChange = (current: number, pageSizeArg: number) => {
    if (pagination && typeof pagination === 'object')
      pagination.onChange?.(current, pageSizeArg)
    refreshPagination(current, pageSizeArg)
    onChange(current, pageSizeArg || mergedPagination.value.pageSize!)
  }

  if (pagination === false)
    return [computed(() => ({})), () => {}] as const
  return [
    computed(() => ({ ...mergedPagination.value, onChange: onInternalChange })),
    refreshPagination,
  ] as const
}

export default usePagination
