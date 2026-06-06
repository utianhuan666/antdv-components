import type { InjectionKey, Ref } from 'vue'
import type { ActionType, ColumnStateType, ProColumns } from '../typing'
import { computed, inject, provide, ref, shallowRef, watch } from 'vue'
import { genColumnKey } from '../utils'

export interface ColumnsState {
  show?: boolean
  fixed?: 'right' | 'left' | undefined
  order?: number
  disable?: boolean | { checkbox: boolean }
}

export type ProTableColumn = ColumnsState & Record<string, any>

export interface UseContainerProps<_T = any> {
  size?: string
  defaultSize?: string
  onSizeChange?: (size: any) => void
  columns?: ProTableColumn[] | ProColumns<_T>[]
  columnsState?: ColumnStateType
}

function mergeColumnsState(
  defaultValue: Record<string, ColumnsState> | undefined,
  storageValue: Record<string, ColumnsState>,
) {
  if (!defaultValue)
    return storageValue

  return Object.keys({ ...defaultValue, ...storageValue }).reduce<Record<string, ColumnsState>>((acc, key) => {
    acc[key] = {
      ...(defaultValue[key] || {}),
      ...(storageValue[key] || {}),
    }
    return acc
  }, {})
}

function getPersistenceStorage(type: ColumnStateType['persistenceType'] | undefined) {
  if (!type || typeof window === 'undefined')
    return undefined
  return window[type]
}

function parseColumnsStateValue(value: string | null | undefined) {
  if (!value)
    return undefined
  return JSON.parse(value) as Record<string, ColumnsState>
}

export function createTableContainer(props: UseContainerProps = {}) {
  const actionRef = shallowRef<ActionType>()
  const rootDomRef = ref<HTMLDivElement>()
  const prefixNameRef = shallowRef<any>()
  const propsRef = shallowRef<any>()
  const keyWords = ref<string | undefined>('')
  const sortKeyColumns = shallowRef<string[]>([])
  const tableSize = ref<any>(props.size || props.defaultSize || 'middle')

  const defaultColumnKeyMap = computed<Record<string, ColumnsState>>(() => {
    if (props.columnsState?.defaultValue)
      return props.columnsState.defaultValue
    const map: Record<string, ColumnsState> = {}
    ;(props.columns || []).forEach((column: any, index) => {
      const key = genColumnKey(column.key ?? column.dataIndex, index)
      map[key] = {
        show: true,
        fixed: column.fixed,
        disable: column.disable,
      }
    })
    return map
  })

  function getStorageColumnsMap() {
    const { persistenceKey, persistenceType, defaultValue } = props.columnsState || {}
    if (!persistenceKey || !persistenceType || typeof window === 'undefined')
      return undefined
    try {
      const raw = getPersistenceStorage(persistenceType)?.getItem(persistenceKey)
      const storageValue = parseColumnsStateValue(raw)
      if (!storageValue)
        return undefined
      return mergeColumnsState(defaultValue, storageValue)
    }
    catch (error) {
      console.warn(error)
      return undefined
    }
  }

  const columnsMap = ref<Record<string, ColumnsState>>(
    props.columnsState?.value
    || getStorageColumnsMap()
    || props.columnsState?.defaultValue
    || defaultColumnKeyMap.value,
  )

  function clearPersistenceStorage() {
    const { persistenceKey, persistenceType } = props.columnsState || {}
    if (!persistenceKey || !persistenceType || typeof window === 'undefined')
      return
    try {
      getPersistenceStorage(persistenceType)?.removeItem(persistenceKey)
    }
    catch (error) {
      console.warn(error)
    }
  }

  watch(
    () => props.columnsState?.value,
    (value) => {
      if (value !== undefined)
        columnsMap.value = value
    },
    { deep: true },
  )

  watch(
    () => props.size,
    (value) => {
      if (value !== undefined)
        tableSize.value = value
    },
  )

  watch(
    () => [props.columnsState?.persistenceKey, props.columnsState?.persistenceType, defaultColumnKeyMap.value] as const,
    () => {
      if (
        props.columnsState?.value !== undefined
        || !props.columnsState?.persistenceKey
        || !props.columnsState?.persistenceType
      ) {
        return
      }
      const storageMap = getStorageColumnsMap()
      setColumnsMap(storageMap || defaultColumnKeyMap.value)
    },
    { deep: true, immediate: true },
  )

  watch(
    () => columnsMap.value,
    (value) => {
      const { persistenceKey, persistenceType } = props.columnsState || {}
      if (!persistenceKey || !persistenceType || typeof window === 'undefined')
        return
      try {
        getPersistenceStorage(persistenceType)?.setItem(persistenceKey, JSON.stringify(value))
      }
      catch (error) {
        console.warn(error)
        clearPersistenceStorage()
      }
    },
    { deep: true, immediate: true },
  )

  function setColumnsMap(value: Record<string, ColumnsState> | ((prev: Record<string, ColumnsState>) => Record<string, ColumnsState>)) {
    const next = typeof value === 'function' ? value(columnsMap.value) : value
    props.columnsState?.onChange?.(next)
    if (props.columnsState?.value === undefined)
      columnsMap.value = next
  }

  function setTableSize(value: any | ((prev: any) => any)) {
    const next = typeof value === 'function' ? value(tableSize.value) : value
    if (props.size === undefined)
      tableSize.value = next
    props.onSizeChange?.(next)
  }

  return {
    actionRef,
    rootDomRef: rootDomRef as Ref<HTMLDivElement | undefined>,
    propsRef,
    keyWords,
    sortKeyColumns,
    tableSize,
    columnsMap,
    defaultColumnKeyMap,
    setAction: (action?: ActionType) => {
      actionRef.value = action
    },
    setSortKeyColumns: (keys: string[]) => {
      sortKeyColumns.value = keys
    },
    setKeyWords: (value?: string) => {
      keyWords.value = value
    },
    setTableSize,
    setPrefixName: (name: any) => {
      prefixNameRef.value = name
    },
    setColumnsMap,
    clearPersistenceStorage,
    get action() {
      return actionRef.value
    },
    get prefixName() {
      return prefixNameRef.value
    },
  }
}

export type TableContainer = ReturnType<typeof createTableContainer>
export const TableContextKey: InjectionKey<TableContainer> = Symbol('ProTableContext')

export function provideTableContext(value: TableContainer) {
  provide(TableContextKey, value)
}

export function useTableContext() {
  return inject(TableContextKey, undefined)
}
