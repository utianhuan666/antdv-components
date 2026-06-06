import type { TableColumnType } from 'antdv-next'
import type { VNodeChild } from 'vue'
import type { TableContainer } from '../Store/Provide'
import type { ProColumns, ProColumnType } from '../typing'
import { Table } from 'antdv-next'
import { genColumnKey, parseProFilteredValue, parseProSortOrder } from '.'
import { proFieldParsingValueEnumToArray } from '../../field'
import { getValueByNamePath, omitBoolean, omitUndefinedAndEmptyArr, runFunction } from '../../utils'
import { columnRender, defaultOnFilter, renderColumnsTitle } from './columnRender'

export interface TableColumnContext<T> {
  counter: TableContainer
  columnEmptyText?: VNodeChild
  type?: string
  editableUtils?: any
  rowKey?: string | number | symbol | ((record: T, index?: number) => string | number)
  childrenColumnName?: string
  proFilter: Record<string, any>
  tableFilter?: Record<string, any>
  proSort: Record<string, any>
}

function resolveOnFilter<T>(column: ProColumnType<T>) {
  const { onFilter, dataIndex } = column
  if (onFilter === true)
    return (value: string, row: T) => defaultOnFilter(value, row, dataIndex as string[])
  return omitBoolean(onFilter as any)
}

function resolveFilters<T>(column: ProColumnType<T>) {
  const { filters = [], valueEnum } = column
  if (filters === true) {
    return proFieldParsingValueEnumToArray(
      runFunction(valueEnum, undefined),
    ).filter(valueItem => valueItem && valueItem.value !== 'all')
  }
  return filters as any
}

function getColumnConfig<T>(
  columnsMap: Record<string, { fixed?: 'left' | 'right' }> | null | undefined,
  columnKey: string,
  column: ProColumnType<T>,
) {
  const config = columnsMap?.[columnKey] || { fixed: column.fixed }
  return { fixed: config.fixed }
}

function updateSubNameRecord<T>(
  rowData: T,
  index: number,
  keyName: string | number | symbol,
  childrenColumnName: string,
  subNameRecord: Map<unknown, unknown[]>,
): unknown {
  if (
    typeof rowData !== 'object'
    || rowData === null
    || !Reflect.has(rowData as object, keyName)
  ) {
    return undefined
  }
  const record = rowData as Record<string, any>
  const uniqueKey = record[keyName as string]
  const parentInfo = subNameRecord.get(uniqueKey) || []
  record[childrenColumnName]?.forEach((item: any) => {
    const itemUniqueKey = item[keyName]
    if (!subNameRecord.has(itemUniqueKey))
      subNameRecord.set(itemUniqueKey, parentInfo.concat([index, childrenColumnName]))
  })
  return uniqueKey
}

function createCellRender<T extends Record<string, any>>(
  column: ProColumnType<T>,
  context: TableColumnContext<T>,
  subNameRecord: Map<unknown, unknown[]>,
) {
  let keyName: string | number | symbol = (context.rowKey ?? 'id') as string
  return function cellRender(text: any, rowData: T, index: number) {
    if (typeof context.rowKey === 'function')
      keyName = context.rowKey(rowData, index) as string
    const uniqueKey = updateSubNameRecord(
      rowData,
      index,
      keyName,
      context.childrenColumnName || 'children',
      subNameRecord,
    )
    const recordKey = typeof context.rowKey === 'function'
      ? context.rowKey(rowData, index)
      : (rowData as any)?.[String(context.rowKey ?? 'id')] ?? index
    return columnRender<T>({
      columnProps: column,
      text,
      rowData,
      index,
      columnEmptyText: context.columnEmptyText as any,
      counter: context.counter,
      type: context.type as any,
      marginSM: (context as any).marginSM,
      subName: (subNameRecord.get(uniqueKey) ?? []) as string[],
      editableUtils: context.editableUtils,
      recordKey,
    })
  }
}

export function genProColumnToColumn<T extends Record<string, any>>({
  columns,
  context,
  parents,
}: {
  columns: ProColumns<T>[]
  context: TableColumnContext<T>
  parents?: ProColumns<T>
}): TableColumnType<T>[] {
  const subNameRecord = new Map<unknown, unknown[]>()

  return (columns || [])
    .map((column, index) => {
      if (column === (Table as any).EXPAND_COLUMN)
        return column as any
      if (column === (Table as any).SELECTION_COLUMN)
        return column as any

      const { key, dataIndex, valueEnum, valueType = 'text', children } = column
      const columnKey = genColumnKey(
        key || (dataIndex as any)?.toString(),
        [parents?.key, index].filter(Boolean).join('-'),
      )
      const noNeedPro = !valueEnum && !valueType && !children
      if (noNeedPro) {
        return {
          index,
          ...column,
        } as TableColumnType<T> & { index?: number }
      }

      const { fixed } = getColumnConfig(
        context.counter.columnsMap.value,
        columnKey,
        column,
      )
      const renderCell = createCellRender(column as ProColumnType<T>, context as any, subNameRecord)
      const tempColumn = {
        index,
        key: columnKey,
        ...column,
        title: renderColumnsTitle(column as any),
        valueEnum,
        filters: resolveFilters(column as any),
        onFilter: resolveOnFilter(column as any),
        filteredValue: parseProFilteredValue(context.proFilter, column),
        sortOrder: parseProSortOrder(context.proSort, column),
        fixed,
        width: context.type === 'list'
          ? column.width
          : column.width || (column.fixed ? 200 : undefined),
        children: children
          ? genProColumnToColumn({
              columns: children,
              context,
              parents: { ...column, key: columnKey } as ProColumns<T>,
            })
          : undefined,
        onCell: (record: T, rowIndex: number) => {
          const cellProps = typeof (column as any).onCell === 'function'
            ? (column as any).onCell(record, rowIndex)
            : {}
          if (column.valueType !== 'option')
            return cellProps
          return {
            ...cellProps,
            onClick: (event: MouseEvent) => {
              ;(cellProps as any)?.onClick?.(event)
              if (event.defaultPrevented || event.target !== event.currentTarget) {
                return
              }
              ;(event.currentTarget as HTMLElement).querySelector<HTMLElement>('a,button')?.click()
            },
          }
        },
        render: renderCell,
        customRender: ({ text, value, record, index: rowIndex }: any) =>
          renderCell(text ?? value ?? getValueByNamePath(record as any, column.dataIndex as any), record, rowIndex),
      }
      return omitUndefinedAndEmptyArr(tempColumn as any) as TableColumnType<T>
    })
    .filter((item: any) => !item.hideInTable) as TableColumnType<T>[]
}
