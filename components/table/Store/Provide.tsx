import type { TableColumnType } from 'antdv-next'
import type { InjectionKey, PropType, Ref } from 'vue'
import type { DensitySize } from '../components/ToolBar/DensityIcon'
import type { ProTableProps } from '../index'
import type { ActionType, Key, ProColumns } from '../typing'
import { computed, defineComponent, inject, provide, ref, watch } from 'vue'
import { merge, useRefFunction } from '../../utils'
import { genColumnKey } from '../utils'

export interface ColumnsState {
  show?: boolean
  fixed?: 'right' | 'left' | undefined
  order?: number
  disable?:
    | boolean
    | {
      checkbox: boolean
    }
}

export type ProTableColumn<T> = ColumnsState & TableColumnType<T>

export interface UseContainerProps<T = any> {
  size?: DensitySize
  defaultSize?: DensitySize
  onSizeChange?: (size: DensitySize) => void
  columns?: ProTableColumn<T>[] | ProColumns<T, T>[]
  columnsState?: ProTableProps<any, any, any>['columnsState']
}

function useContainer(props: UseContainerProps = {}) {
  /**
   * action / prefixName / sortKeyColumns 是非响应式的普通引用：
   * React 中它们是 useRef（写入不触发重渲染，读取必须实时）。
   * Vue 中用普通闭包变量持有，通过 getter 实时读取。
   */
  let actionRef: ActionType | undefined
  const rootDomRef = ref<HTMLDivElement | null>(null)
  /** 父 form item 的 name */
  let prefixNameRef: any

  /** 自己 props 的引用 */
  const propsRef = ref<ProTableProps<any, any, any>>()

  // 共享状态比较难，就放到这里了
  const keyWords = ref<string | undefined>('')
  // 用于排序的数组
  let sortKeyColumns: string[] = []

  const tableSizeInner = ref<DensitySize>(
    props.size || props.defaultSize || 'middle',
  )
  const tableSize = computed<DensitySize>(() =>
    props.size !== undefined ? props.size : tableSizeInner.value,
  )
  const setTableSize = useRefFunction(
    (updater: DensitySize | ((prev: DensitySize) => DensitySize)) => {
      const next
        = typeof updater === 'function'
          ? (updater as (p: DensitySize) => DensitySize)(tableSize.value)
          : updater
      props.onSizeChange?.(next)
      tableSizeInner.value = next
    },
  )

  /** 默认全选中 */
  const defaultColumnKeyMap = computed(() => {
    if (props?.columnsState?.defaultValue)
      return props.columnsState.defaultValue
    const columnKeyMap = {} as Record<string, any>
    props.columns?.forEach((column: any, index: number) => {
      // 兼容 Table.EXPAND_COLUMN / Table.SELECTION_COLUMN 等占位列（非普通列对象）
      if (!column || typeof column !== 'object') {
        return
      }
      const { key, dataIndex, fixed, disable } = column as any
      const columnKey = genColumnKey(key ?? (dataIndex as Key), index)
      if (columnKey) {
        columnKeyMap[columnKey] = {
          show: true,
          fixed,
          disable,
        }
      }
    })
    return columnKeyMap
  })

  const columnsMapInner = ref<Record<string, ColumnsState>>((() => {
    const { persistenceType, persistenceKey } = props.columnsState || {}

    if (persistenceKey && persistenceType && typeof window !== 'undefined') {
      /** 从持久化中读取数据 */
      const storage = window[persistenceType] as unknown as Storage
      try {
        const storageValue = storage?.getItem(persistenceKey)
        if (storageValue) {
          if (props?.columnsState?.defaultValue) {
            // 实际生产中，defaultValue往往作为系统方默认配置，则优先级不应高于用户配置的storageValue
            return merge(
              {},
              props?.columnsState?.defaultValue,
              JSON.parse(storageValue),
            )
          }
          return JSON.parse(storageValue)
        }
      }
      catch (error) {
        console.warn(error)
      }
    }
    return (
      props.columnsState?.value
      || props.columnsState?.defaultValue
      || defaultColumnKeyMap.value
    )
  })())
  const columnsMap = computed<Record<string, ColumnsState>>(() =>
    props.columnsState?.value !== undefined
      ? props.columnsState.value
      : columnsMapInner.value,
  )
  const onColumnsMapChange = computed(() => props.columnsState?.onChange)
  const setColumnsMap = useRefFunction(
    (
      updater:
        | Record<string, ColumnsState>
        | ((
          prev: Record<string, ColumnsState>,
        ) => Record<string, ColumnsState>),
    ) => {
      const next
        = typeof updater === 'function'
          ? (
              updater as (
                p: Record<string, ColumnsState>,
              ) => Record<string, ColumnsState>
            )(columnsMap.value)
          : updater
      onColumnsMapChange.value?.(next)
      columnsMapInner.value = next
    },
  )

  /**
   * 配置或列更改时对 columnsMap 重新赋值。
   *
   * 协议（被 `tests/table/dynamic-columns-state.test.tsx#51 columnSetting
   * columnsState.persistenceKey change` 明确锁定）：
   *   - persistenceKey / persistenceType 切换到新键时，
   *     - 新键 storage 中已有数据 → 用 storage 数据（含 defaultValue merge）覆盖；
   *     - 新键 storage 中无数据 → 必须把 columnsMap 重置回 defaultColumnKeyMap，
   *       不能保留旧键的修改痕迹。这是「切到新表/新场景应该用默认值打底」
   *       的有意行为，不是 bug。
   *   - defaultColumnKeyMap（依赖 props.columns）重算时同样按上述规则同步。
   *
   * 历史教训：曾经把 else 分支当成「覆盖用户修改」的 bug 删除，
   * 立刻击穿上面的测试用例（rerender 切 persistenceKey 后新键应回到默认全选）。
   * 不要再误判这是 bug。
   */
  watch(
    [
      () => props.columnsState?.persistenceKey,
      () => props.columnsState?.persistenceType,
      defaultColumnKeyMap,
    ],
    () => {
      const { persistenceType, persistenceKey, defaultValue }
        = props.columnsState || {}

      if (!persistenceKey || !persistenceType || typeof window === 'undefined') {
        return
      }

      /** 从持久化中读取数据 */
      const storage = window[persistenceType] as unknown as Storage
      try {
        const storageValue = storage?.getItem(persistenceKey)
        if (!storageValue) {
          // 切到新的 persistenceKey 且 storage 中没有数据时，回退到默认值
          // （不能保留旧键的修改痕迹，详见上方注释）
          setColumnsMap(defaultColumnKeyMap.value)
          return
        }
        if (defaultValue) {
          // defaultValue 作为系统方默认配置，优先级低于用户在 storage 中的修改
          setColumnsMap(merge({}, defaultValue, JSON.parse(storageValue)))
        }
        else {
          setColumnsMap(JSON.parse(storageValue))
        }
      }
      catch (error) {
        console.warn(error)
      }
    },
    { flush: 'post' },
  )

  /** 清空一下当前的 key */
  const clearPersistenceStorage = useRefFunction(() => {
    const { persistenceType, persistenceKey } = props.columnsState || {}

    if (!persistenceKey || !persistenceType || typeof window === 'undefined')
      return

    /** 给持久化中设置数据 */
    const storage = window[persistenceType] as unknown as Storage
    try {
      storage?.removeItem(persistenceKey)
    }
    catch (error) {
      console.warn(error)
    }
  })

  watch(
    [
      () => props.columnsState?.persistenceKey,
      columnsMap,
      () => props.columnsState?.persistenceType,
    ],
    () => {
      if (
        !props.columnsState?.persistenceKey
        || !props.columnsState?.persistenceType
      ) {
        return
      }
      if (typeof window === 'undefined')
        return
      /** 给持久化中设置数据 */
      const { persistenceType, persistenceKey } = props.columnsState
      const storage = window[persistenceType] as unknown as Storage
      try {
        storage?.setItem(persistenceKey, JSON.stringify(columnsMap.value))
      }
      catch (error) {
        console.warn(error)
        clearPersistenceStorage()
      }
    },
    // mirror React useEffect([columnsMap])：挂载时即把初始 columnsMap 写入持久化存储
    // （否则首帧 sessionStorage 为空，见 dynamic-columns-state 测试首段断言）。
    { flush: 'post', immediate: true },
  )

  /**
   * Context value：暴露给所有 useContainer 的消费者。
   *
   * 注意三点设计：
   * 1. `action` / `prefixName` / `sortKeyColumns` 用 ES6 getter 暴露 ref 的当前值，
   *    保证消费者每次读取都能拿到最新值（普通引用写入不会触发重渲染，但读取必须实时）。
   * 2. `setSortKeyColumns` / `setPrefixName` 对外是 mutator 函数 API，内部直接写
   *    对应引用，不触发重渲染。这是有意的协议，请勿改成响应式 state。
   * 3. 不要把 `props.columns` 放进 context —— 所有消费者都直接从 `props.columns`
   *    或 `columnsMap` 拿数据。
   */
  const renderValue = {
    setAction: (newAction?: ActionType) => {
      actionRef = newAction
    },
    setSortKeyColumns: (keys: string[]) => {
      sortKeyColumns = keys
    },
    propsRef,
    setKeyWords: (words: string | undefined) => {
      keyWords.value = words
    },
    setTableSize,
    setPrefixName: (name: any) => {
      prefixNameRef = name
    },
    setColumnsMap,
    rootDomRef,
    clearPersistenceStorage,
    get columnsMap() {
      return columnsMap.value
    },
    get keyWords() {
      return keyWords.value
    },
    get tableSize() {
      return tableSize.value
    },
    get defaultColumnKeyMap() {
      return defaultColumnKeyMap.value
    },
    get action() {
      return actionRef
    },
    get prefixName(): string {
      return prefixNameRef
    },
    get sortKeyColumns(): string[] {
      return sortKeyColumns
    },
  }

  return renderValue
}

export type ContainerType = typeof useContainer
type ContainerReturnType = ReturnType<ContainerType>

export const TableContext: InjectionKey<ContainerReturnType> = Symbol('TableContext')

export function provideContainer(value: ContainerReturnType) {
  provide(TableContext, value)
}

export function useTableContext() {
  return inject(TableContext, {} as ContainerReturnType)
}

const TableProvider = defineComponent({
  name: 'TableProvider',
  props: {
    initValue: {
      type: Object as PropType<UseContainerProps<any>>,
      default: () => ({}),
    },
  },
  setup(props, { slots }) {
    // useContainer 只在 setup 调用一次，会捕获 initValue 的当时引用；但 ProTable rerender 时
    // 外层会传入新的 initValue 对象（如切换 columnsState.persistenceKey）。用 Proxy 透传到
    // 当前 props.initValue，使 Store 内部 `props.columnsState` 等始终读到最新值并保持响应式追踪
    // （见 dynamic-columns-state：rerender 切 persistenceKey 后新键应写入默认 columnsMap）。
    const liveProps = new Proxy({} as Record<string | symbol, any>, {
      get: (_t, key) => (props.initValue as any)?.[key],
      has: (_t, key) => key in ((props.initValue as any) || {}),
      ownKeys: () => Reflect.ownKeys((props.initValue as any) || {}),
      getOwnPropertyDescriptor: (_t, key) =>
        Reflect.getOwnPropertyDescriptor((props.initValue as any) || {}, key)
        ?? { configurable: true, enumerable: true, value: (props.initValue as any)?.[key] },
    })
    const value = useContainer(liveProps as UseContainerProps<any>)
    provideContainer(value)
    return () => slots.default?.()
  },
})

/**
 * @deprecated 使用 `TableProvider` 替代。
 */
const Container = TableProvider

export { Container, TableProvider, useContainer }

export type { Ref }
