import type { TablePaginationConfig } from 'antdv-next'
import type { Ref } from 'vue'
import type { IntlType } from '../../provider'
import type { UseEditableUtilType } from '../../utils'
import type {
  ActionType,
  Bordered,
  BorderedType,
  FilterValue,
  ProColumns,
  ProColumnType,
  ProSorter,
  SortOrder,
  UseFetchDataAction,
} from '../typing'

export const checkUndefinedOrNull = (value: any) => value !== undefined && value !== null

export function genColumnKey(key?: string | number | (string | number)[], index?: number | string): string {
  if (key)
    return Array.isArray(key) ? key.join('-') : String(key)
  return `${index}`
}

export function parseDataIndex(dataIndex: ProColumnType['dataIndex']): string | undefined {
  if (Array.isArray(dataIndex))
    return dataIndex.join(',')
  return dataIndex?.toString()
}

export function flattenColumns(data: any[] = []): any[] {
  const list: any[] = []
  data.forEach((item) => {
    if (item?.children)
      list.push(...flattenColumns(item.children))
    else
      list.push(item)
  })
  return list
}

export function isBordered(borderType: BorderedType, border?: Bordered) {
  if (border === undefined)
    return false
  if (typeof border === 'boolean')
    return border
  return border[borderType]
}

export function isLocalSorter<T>(sorter?: ProSorter<T>) {
  return typeof sorter === 'function' || (typeof sorter === 'object' && typeof sorter?.compare === 'function')
}

export function isLocalFilter<T>(filters: ProColumnType<T>['filters'], onFilter: ProColumnType<T>['onFilter']) {
  return Boolean(filters && onFilter)
}

export function getServerFilterResult<T>(filters: Record<string, any>, columns: ProColumnType<T>[]) {
  return Object.entries(filters || {}).reduce<Record<string, FilterValue>>((acc, [key, value]) => {
    const column = columns.find(column => parseDataIndex(column.dataIndex) === key)
    if (column && !isLocalFilter(column.filters, column.onFilter))
      acc[key] = value as FilterValue
    return acc
  }, {})
}

export function getServerSorterResult<T>(sorterResult: any) {
  const result = Array.isArray(sorterResult) ? sorterResult : [sorterResult]
  return result.reduce<Record<string, SortOrder>>((acc, item) => {
    const column = item?.column || {}
    const sorter = column.sorter
    if (sorter && isLocalSorter<T>(sorter))
      return acc
    const key = typeof sorter === 'string' ? sorter : parseDataIndex(column.dataIndex)
    if (key)
      acc[key] = item?.order
    return acc
  }, {})
}

export function parseServerDefaultColumnConfig<T, Value>(columns: ProColumns<T, Value>[]) {
  const filter: Record<string, FilterValue> = {}
  const sort: Record<string, SortOrder> = {}
  columns.forEach((column) => {
    const dataIndex = parseDataIndex(column.dataIndex)
    if (!dataIndex)
      return
    if (column.filters && !isLocalFilter(column.filters, column.onFilter))
      filter[dataIndex] = (column.defaultFilteredValue as FilterValue) ?? null
    if (column.sorter && !isLocalSorter(column.sorter)) {
      const key = typeof column.sorter === 'string' ? column.sorter : dataIndex
      sort[key] = column.defaultSortOrder ?? null
    }
  })
  return { sort, filter }
}

export function parseProSortOrder<T>(proSort: Record<string, SortOrder>, column: ProColumnType<T>) {
  if (column.sortOrder !== undefined)
    return column.sortOrder
  if (!column.sorter)
    return undefined
  if (isLocalSorter(column.sorter))
    return undefined
  const key = typeof column.sorter === 'string' ? column.sorter : parseDataIndex(column.dataIndex)
  return key ? proSort[key] : undefined
}

export function parseProFilteredValue<T>(proFilter: Record<string, FilterValue>, column: ProColumnType<T>) {
  if (column.filteredValue !== undefined)
    return column.filteredValue as FilterValue
  if (!column.filters)
    return undefined
  if (isLocalFilter(column.filters, column.onFilter))
    return undefined
  const key = parseDataIndex(column.dataIndex)
  return key ? proFilter[key] : undefined
}

export function mergePagination<T>(
  pagination: TablePaginationConfig | boolean | undefined,
  pageInfo: UseFetchDataAction<T>['pageInfo'] & { setPageInfo: any },
  intl: IntlType,
): TablePaginationConfig | false | undefined {
  if (pagination === false)
    return false
  const { total, current, pageSize, setPageInfo } = pageInfo
  const defaultPagination = typeof pagination === 'object' ? pagination : {}
  return {
    showTotal: (all: number, range: [number, number]) =>
      `${intl.getMessage('pagination.total.range', '第')} ${range[0]}-${range[1]} ${intl.getMessage('pagination.total.total', '条/总共')} ${all} ${intl.getMessage('pagination.total.item', '条')}`,
    total,
    ...defaultPagination,
    current: pagination !== true && pagination
      ? ((pagination as TablePaginationConfig).current ?? current)
      : current,
    pageSize: pagination !== true && pagination
      ? ((pagination as TablePaginationConfig).pageSize ?? pageSize)
      : pageSize,
    onChange: (page: number, newPageSize?: number) => {
      ;(pagination as TablePaginationConfig)?.onChange?.(page, newPageSize || 20)
      if (newPageSize !== pageSize || current !== page)
        setPageInfo({ pageSize: newPageSize, current: page })
    },
  }
}

export function postDataPipeline<T>(data: T, pipeline: ((data: T) => T)[]) {
  if (pipeline.filter(item => item).length < 1)
    return data
  return pipeline.reduce((result, fn) => fn(result), data)
}

export function resolveTableViewDefaultDom(defaultDom: any) {
  return typeof defaultDom === 'function' ? defaultDom() : defaultDom
}

function setRefValue<T>(target: Ref<T | undefined> | { current?: T } | undefined, value: T) {
  if (!target)
    return
  if ('value' in target) {
    ;(target as Ref<T | undefined>).value = value
    return
  }
  ;(target as { current?: T }).current = value
}

export function useActionType<T>(
  actionRef: Ref<ActionType | undefined> | { current?: ActionType } | undefined,
  action: UseFetchDataAction<T>,
  props: {
    nativeElement?: HTMLDivElement
    focus?: () => void
    fullScreen: () => void
    onCleanSelected: () => void
    resetAll: () => void | Promise<void>
    editableUtils: UseEditableUtilType
    scrollTo?: ActionType['scrollTo']
  },
) {
  const userAction: ActionType = {
    ...props.editableUtils,
    pageInfo: action.pageInfo,
    nativeElement: props.nativeElement,
    focus: props.focus,
    reload: async (resetPageIndex?: boolean) => {
      if (resetPageIndex)
        await action.setPageInfo({ current: 1 })
      await action?.reload()
    },
    reloadAndRest: async () => {
      props.onCleanSelected()
      await action.setPageInfo({ current: 1 })
      await action?.reload()
    },
    reset: async () => {
      await props.resetAll()
      await action?.reset?.()
      await action?.reload()
    },
    fullScreen: () => props.fullScreen(),
    clearSelected: () => props.onCleanSelected(),
    setPageInfo: rest => action.setPageInfo(rest),
    scrollTo: props.scrollTo,
  }
  setRefValue(actionRef, userAction)
}

export const isMergeCell = (dom: any) => dom && typeof dom === 'object' && dom?.props?.colSpan

export function buildEditableTableRowKey<DataType extends Record<string, any>>(
  rowKey: string | number | symbol | ((record: DataType, index?: number) => string | number),
  _name: any,
) {
  if (typeof rowKey === 'function')
    return rowKey

  const rowKeyStr = String(rowKey)
  return (record: DataType, index?: number) => {
    if (index === -1)
      return (record as any)?.[rowKeyStr]
    return (record as any)?.[rowKeyStr] ?? index?.toString() ?? ''
  }
}

export function resolveEditingPayloadForRowEditableOnChange<DataType extends Record<string, any>>(
  keys: (string | number)[],
  dataSource: readonly DataType[] | undefined,
  getRowKey: (record: DataType, index?: number) => string | number,
  editableType: 'single' | 'multiple' | undefined,
  childrenColumnName = 'children',
): DataType | DataType[] {
  const cleanKeys = keys.filter(key => key !== undefined)
  const kvMap = new Map<string | number, DataType>()
  const dig = (records: readonly DataType[]) => {
    records.forEach((record, index) => {
      const rowKey = getRowKey(record, index)
      kvMap.set(rowKey, record)
      if (
        record
        && typeof record === 'object'
        && childrenColumnName in record
      ) {
        dig(((record as any)[childrenColumnName] || []) as DataType[])
      }
    })
  }
  dig(dataSource ?? [])
  const editingRecords = cleanKeys
    .map(key => kvMap.get(key))
    .filter((record): record is DataType => record !== undefined)
  return ((editableType || 'single') === 'single' ? editingRecords[0] : editingRecords) as DataType | DataType[]
}
