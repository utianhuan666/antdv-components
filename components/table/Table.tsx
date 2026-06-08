import type { TablePaginationConfig } from 'antdv-next'
import type {
  FilterValue as AntFilterValue,
  GetRowKey,
  SortOrder,
  SorterResult,
  TableCurrentDataSource,
} from 'antdv-next/dist/table/interface'
import type { CSSProperties, PropType, Ref, VNodeChild } from 'vue'
import type { ParamsType } from '../provider'
import type { UseEditableUtilType } from '../utils'
import type {
  ActionType,
  FilterValue,
  Key,
  OptionSearchProps,
  PageInfo,
  ProTableProps,
  RequestData,
  TableRowSelection,
  UseFetchDataAction,
} from './typing'
import type { TableColumnContext } from './utils/genProColumnToColumn'
import { clsx } from '@v-c/util'
import { ConfigProvider, Table } from 'antdv-next'
import { useConfig } from 'antdv-next/dist/config-provider/context'
import {
  computed,
  defineComponent,
  provide,
  ref,
  watch,
} from 'vue'
import ProCard from '../card'
import ValueTypeToComponent from '../field/ValueTypeToComponent'
import { GridContext, ProForm } from '../form'
import {
  ProConfigProvider,
  proTheme,
  useIntl,
  useProProviderContext,
} from '../provider'
import {
  editableRowByKey,
  ErrorBoundary,
  isDeepEqualReact,
  omitUndefined,
  recordKeyToString,
  stringify,
  useDeepCompareEffect,
  useDeepCompareEffectDebounce,
  useEditableArray,
  useRefFunction,
} from '../utils'
import TableAlert from './components/Alert'
import { TableProvider, useTableContext } from './Store/Provide'
import { useStyle } from './style'
import { TableSearch } from './TableSearch'
import { TableToolbar } from './TableToolbar'
import useFetchData from './useFetchData'
import {
  flattenColumns,
  genColumnKey,
  getServerFilterResult,
  getServerSorterResult,
  isBordered,
  mergePagination,
  parseServerDefaultColumnConfig,
  useActionType,
} from './utils'
import { columnSort } from './utils/columnSort'
import { genProColumnToColumn } from './utils/genProColumnToColumn'

function isEmpty(value: any): boolean {
  if (value == null)
    return true
  if (Array.isArray(value) || typeof value === 'string')
    return value.length === 0
  if (typeof value === 'object')
    return Object.keys(value).length === 0
  return false
}

function getEditableDataSource<T>({
  dataSource,
  editableUtils,
  pagination,
  getRowKey,
  childrenColumnName,
}: {
  dataSource: readonly T[] | undefined
  editableUtils: {
    newLineRecord?: {
      options?: {
        position?: 'top' | 'bottom' | string
        parentKey?: Key | Key[]
        recordKey?: Key | Key[]
      }
      defaultValue?: T
    }
  }
  pagination: ProTableProps<T, any, any>['pagination']
  getRowKey: GetRowKey<any>
  childrenColumnName?: string
}): T[] {
  const baseData = Array.isArray(dataSource) ? [...dataSource] : []
  const newLineConfig = editableUtils?.newLineRecord
  const defaultValue = newLineConfig?.defaultValue

  if (!newLineConfig || !defaultValue) {
    return baseData
  }

  const { options: newLineOptions } = newLineConfig
  const childrenName = childrenColumnName || 'children'

  if (newLineOptions?.parentKey) {
    const newRow = {
      ...defaultValue,
      map_row_parentKey: recordKeyToString(
        newLineOptions.parentKey as any,
      )?.toString(),
    }
    const actionProps = {
      data: baseData,
      getRowKey,
      row: newRow,
      key: newLineOptions?.recordKey ?? getRowKey(newRow as T, -1),
      childrenColumnName: childrenName,
    }

    return editableRowByKey(
      actionProps as any,
      newLineOptions?.position === 'top' ? 'top' : 'update',
    ) as T[]
  }

  if (newLineOptions?.position === 'top') {
    return [defaultValue, ...baseData]
  }

  const pageConfig
    = pagination && typeof pagination === 'object' ? pagination : undefined

  if (pageConfig?.current && pageConfig?.pageSize) {
    if (pageConfig.pageSize > baseData.length) {
      baseData.push(defaultValue)
      return baseData
    }
    const insertIndex = pageConfig.current * pageConfig.pageSize - 1
    baseData.splice(insertIndex, 0, defaultValue)
    return baseData
  }

  baseData.push(defaultValue)
  return baseData
}

function getTableCardBodyStyle({
  propsCardProps,
  notNeedCardDom,
  name,
  hideToolbar,
  toolbarDom,
}: {
  propsCardProps: ProTableProps<any, any, any>['cardProps']
  notNeedCardDom: boolean
  name: ProTableProps<any, any, any>['name']
  hideToolbar: boolean
  toolbarDom: VNodeChild
}): CSSProperties {
  // cardProps === false 或存在 name 的场景不需要额外 padding 处理
  if (propsCardProps === false || notNeedCardDom || !!name) {
    return {}
  }

  // 显式隐藏 toolbar 时，统一不留 padding（避免误用 paddingBlockStart）
  if (hideToolbar) {
    return { padding: 0 }
  }

  // 有 toolbar 的场景，需要让 ProCard body 顶部与 toolbar 对齐
  if (toolbarDom) {
    return { paddingBlockStart: 0 }
  }

  return { padding: 0 }
}

function buildRowKey<T>(
  rowKey: ProTableProps<T, any, any>['rowKey'],
  name: ProTableProps<T, any, any>['name'],
): GetRowKey<any> {
  // mirror: useRowKey —— rowKey 在 render 中通过 props 读取，故每次构建即可
  if (typeof rowKey === 'function') {
    return rowKey as GetRowKey<any>
  }
  return (record: T, index?: number) => {
    if (index === -1) {
      return (record as any)?.[rowKey as string]
    }
    if (name) {
      return index?.toString() as any
    }
    return (record as any)?.[rowKey as string] ?? index?.toString()
  }
}

const emptyObj = {} as Record<string, any>

/**
 * ProTable 引擎本体（对应 React 的内部 ProTable）。
 * 通过 useTableContext 注入由外层 TableProvider 提供的 Store。
 */
const ProTable = defineComponent({
  name: 'ProTable',
  inheritAttrs: false,
  props: {
    proTableProps: {
      type: Object as PropType<ProTableProps<any, any, any> & { defaultClassName: string }>,
      required: true,
    },
  },
  setup(componentProps) {
    const counter = useTableContext()
    const intl = useIntl()
    const themeToken = proTheme.useToken()
    const { wrapSSR, hashId } = useStyle(componentProps.proTableProps.defaultClassName)

    /** 通用的来操作子节点的工具类 */
    const actionRef = ref<ActionType>()
    // antd Table 实例 ref（仅用于转发 scrollTo 能力）
    const antTableRef = ref<any>(null)

    const defaultFormRef = ref<any>()

    /** 单选多选的相关逻辑：受控/非受控合并 */
    const selectedRowKeysInner = ref<(string | number)[] | Key[] | undefined>(
      (() => {
        const propsRowSelection = componentProps.proTableProps.rowSelection
        return propsRowSelection
          ? propsRowSelection?.defaultSelectedRowKeys || []
          : undefined
      })(),
    )
    const selectedRowKeys = computed<(string | number)[] | Key[] | undefined>(() => {
      const propsRowSelection = componentProps.proTableProps.rowSelection
      const controlled
        = propsRowSelection ? propsRowSelection.selectedRowKeys : undefined
      return controlled !== undefined ? (controlled as any) : selectedRowKeysInner.value
    })
    const setSelectedRowKeys = (keys: (string | number)[] | Key[] | undefined) => {
      selectedRowKeysInner.value = keys
    }

    const formSearch = ref<Record<string, any> | undefined>(
      (() => {
        const { manualRequest, search } = componentProps.proTableProps
        // 如果手动模式，或者 search 不存在的时候设置为 undefined
        // undefined 就不会触发首次加载
        if (manualRequest || search !== false) {
          return undefined
        }
        return {}
      })(),
    )

    /**
     * `actionRef.current?.reset()` 会在同一事件循环里同步调用 `action.reload()`。
     * 使用 ref 作为请求参数的同步来源，保证 reset/toolbar 等场景下参数与表单展示一致。
     */
    const formSearchRef = ref<Record<string, any> | undefined>(formSearch.value)
    const setFormSearchWithRef = useRefFunction(
      (next: any) => {
        const nextValue
          = typeof next === 'function' ? next(formSearchRef.value) : next
        formSearchRef.value = nextValue
        formSearch.value = nextValue
      },
    )

    const propsColumns = computed(() => componentProps.proTableProps.columns ?? [])

    const defaultProConfig = computed(() => {
      const { sort, filter } = parseServerDefaultColumnConfig(
        flattenColumns(propsColumns.value),
      )
      return {
        defaultProFilter: filter,
        defaultProSort: sort,
      }
    })

    const proFilter = ref<Record<string, FilterValue>>(defaultProConfig.value.defaultProFilter)
    const proSort = ref<Record<string, SortOrder>>(defaultProConfig.value.defaultProSort)

    /**
     * 只有在 proColumns 变化的时候，才会重新更新 proFilter 和 proSort
     */
    useDeepCompareEffect(() => {
      proFilter.value = defaultProConfig.value.defaultProFilter
      proSort.value = defaultProConfig.value.defaultProSort
    }, [() => defaultProConfig.value.defaultProFilter, () => defaultProConfig.value.defaultProSort])

    /** 需要初始化 不然默认可能报错 */
    const fetchPagination = computed(() => {
      const propsPagination = componentProps.proTableProps.pagination
      return typeof propsPagination === 'object'
        ? (propsPagination as TablePaginationConfig)
        : { defaultCurrent: 1, defaultPageSize: 20, pageSize: 20, current: 1 }
    })

    // 设置 name 到 store 中，必须在 render 阶段同步 set
    // mirror: counter.setPrefixName(props.name) 必须同步在 render 顶部执行
    const syncPrefixName = () => {
      counter.setPrefixName?.(componentProps.proTableProps.name)
    }
    syncPrefixName()

    // ============================ useFetchData ============================
    const fetchData = computed(() => {
      const { request, params = emptyObj } = componentProps.proTableProps
      if (!request)
        return undefined
      return async (pageParams?: Record<string, any>) => {
        const actionParams = {
          ...(pageParams || {}),
          ...(formSearchRef.value || {}),
          ...params,
        }

        delete actionParams._timestamp
        const response = await request(
          actionParams as any,
          proSort.value,
          proFilter.value,
        )
        return response as RequestData<any>
      }
    })

    const action = useFetchData(
      ((p?: any) => fetchData.value?.(p)) as any,
      componentProps.proTableProps.defaultData,
      {
        get pageInfo() {
          return componentProps.proTableProps.pagination === false
            ? false
            : fetchPagination.value
        },
        get loading() {
          return componentProps.proTableProps.loading
        },
        get dataSource() {
          return componentProps.proTableProps.dataSource
        },
        onDataSourceChange: componentProps.proTableProps.onDataSourceChange,
        onLoad: componentProps.proTableProps.onLoad as any,
        onLoadingChange: componentProps.proTableProps.onLoadingChange,
        onRequestError: componentProps.proTableProps.onRequestError,
        postData: componentProps.proTableProps.postData,
        revalidateOnFocus: componentProps.proTableProps.revalidateOnFocus ?? false,
        get manual() {
          return formSearch.value === undefined
        },
        get polling() {
          return componentProps.proTableProps.polling
        },
        effects: [
          () => stringify(componentProps.proTableProps.params),
          () => stringify(formSearch.value),
          () => stringify(proFilter.value),
          () => stringify(proSort.value),
        ] as any,
        debounceTime: componentProps.proTableProps.debounceTime,
        onPageInfoChange: (pageInfo: PageInfo) => {
          const propsPagination = componentProps.proTableProps.pagination
          if (!propsPagination || !fetchData.value)
            return
          // 总是触发一下 onChange 和 onShowSizeChange
          ;(propsPagination as TablePaginationConfig)?.onChange?.(pageInfo.current, pageInfo.pageSize)
          ;(propsPagination as TablePaginationConfig)?.onShowSizeChange?.(pageInfo.current, pageInfo.pageSize)
        },
      } as any,
    )
    // ============================ END ============================

    /** 聚焦的时候重新请求数据 */
    const onVisibilityChange = useRefFunction(() => {
      if (document.visibilityState !== 'visible')
        return
      const props = componentProps.proTableProps
      if (
        props.manualRequest
        || !props.request
        || !(props.revalidateOnFocus ?? false)
        || props.form?.ignoreRules
      ) {
        return
      }
      action.reload()
    })
    watch(
      () => true,
      () => {
        document.addEventListener('visibilitychange', onVisibilityChange)
      },
      { immediate: true, flush: 'post' },
    )

    /** SelectedRowKeys受控处理selectRows */
    const preserveRecordsRef = ref(new Map<any, any>())

    // ============================ RowKey ============================
    const getRowKey = computed<GetRowKey<any>>(() =>
      buildRowKey(componentProps.proTableProps.rowKey, componentProps.proTableProps.name),
    )

    useDeepCompareEffect(() => {
      if (!action.dataSource?.length) {
        return
      }
      action.dataSource.forEach((data: any) => {
        const dataRowKey = getRowKey.value(data, -1)
        preserveRecordsRef.value.set(dataRowKey, data)
      })
    }, [() => action.dataSource, getRowKey])

    /** 页面编辑的计算 */
    const pagination = computed(() => {
      const propsPagination = componentProps.proTableProps.pagination
      const { request, type = 'table' } = componentProps.proTableProps
      const newPropsPagination
        = propsPagination === false ? false : { ...(propsPagination || {}) }
      const pageConfig = {
        ...action.pageInfo,
        setPageInfo: ({ pageSize, current }: PageInfo) => {
          const pageInfo = action.pageInfo
          if (pageSize === pageInfo.pageSize || pageInfo.current === 1) {
            action.setPageInfo({ pageSize, current })
            return
          }
          if (request)
            action.setDataSource([])
          action.setPageInfo({
            pageSize,
            current: type === 'list' ? current : 1,
          })
        },
      }
      if (request && newPropsPagination) {
        delete (newPropsPagination as TablePaginationConfig).onChange
        delete (newPropsPagination as TablePaginationConfig).onShowSizeChange
      }
      return mergePagination<any>(
        newPropsPagination as TablePaginationConfig | false | undefined,
        pageConfig as any,
        intl,
      )
    })

    // 监听 pagination 的变化，修正 pageSize
    useDeepCompareEffect(() => {
      const p = pagination.value
      if (
        p
        && (p.current !== action.pageInfo.current
          || p.pageSize !== action.pageInfo.pageSize)
      ) {
        action.setPageInfo({
          current: p.current,
          pageSize: p.pageSize,
        })
      }
    }, [pagination])

    useDeepCompareEffect(() => {
      const props = componentProps.proTableProps
      // request 存在且params不为空，且已经请求过数据才需要设置。
      if (
        props.request
        && !isEmpty(props.params)
        && action.dataSource
        && !isDeepEqualReact(action.dataSource, props.defaultData)
        && action?.pageInfo?.current !== 1
      ) {
        action.setPageInfo({
          current: 1,
        })
      }
    }, [() => componentProps.proTableProps.params])

    // 设置 columnsState 到 store 中（仅在受控 value 时同步）
    watch(
      () => componentProps.proTableProps.columnsState?.value,
      (value) => {
        if (value !== undefined) {
          counter.setColumnsMap(value)
        }
      },
      { immediate: true, flush: 'post' },
    )

    /** 清空所有的选中项 */
    const onCleanSelected = useRefFunction(() => {
      const propsRowSelection = componentProps.proTableProps.rowSelection
      if (propsRowSelection && propsRowSelection.onChange) {
        propsRowSelection.onChange([], [], {
          type: 'none',
        })
      }
      setSelectedRowKeys([])
    })

    // mirror: counter.propsRef.current = props
    const syncPropsRef = () => {
      if (counter.propsRef)
        counter.propsRef.value = componentProps.proTableProps as any
    }
    syncPropsRef()

    /** 可编辑行的相关配置 */
    const editableUtils = useEditableArray<any>({
      ...componentProps.proTableProps.editable,
      tableName: componentProps.proTableProps.name as any,
      dateFormatter:
        componentProps.proTableProps.editable?.dateFormatter
        ?? componentProps.proTableProps.dateFormatter,
      getRowKey: getRowKey.value,
      childrenColumnName:
        componentProps.proTableProps.expandable?.childrenColumnName || 'children',
      get dataSource() {
        return action.dataSource || []
      },
      setDataSource: (data: any) => {
        componentProps.proTableProps.editable?.onValuesChange?.(undefined as any, data)
        action.setDataSource(data)
      },
    } as any) as UseEditableUtilType

    // ============================ Render ============================

    /** 绑定 action */
    useActionType(actionRef, action, {
      get nativeElement() {
        return counter.rootDomRef?.value || undefined
      },
      focus: () => {
        counter.rootDomRef?.value?.focus()
      },
      fullScreen: () => {
        if (!counter.rootDomRef?.value || !document.fullscreenEnabled) {
          return
        }
        if (document.fullscreenElement) {
          document.exitFullscreen()
        }
        else {
          counter.rootDomRef?.value.requestFullscreen()
        }
      },
      onCleanSelected: () => {
        onCleanSelected()
      },
      resetAll: () => {
        const { beforeSearchSubmit } = componentProps.proTableProps
        // 清空选中行
        onCleanSelected()
        // 清空 toolbar 搜索
        counter.setKeyWords(undefined)
        // 重置页码
        action.setPageInfo({
          current: 1,
        })
        // 重置绑定筛选值
        proFilter.value = defaultProConfig.value.defaultProFilter
        // 重置绑定排序值
        proSort.value = defaultProConfig.value.defaultProSort
        // 重置表单
        // 用户传入的 formRef 可能是 Vue Ref(.value) 或 React 风格 createRef({ current })，两者都要兼容；
        // 否则取不到表单实例，reset 后拿不到初始值，refetch 丢失表单参数（见 protable-reset-params）。
        const userFormRef = componentProps.proTableProps.formRef as any
        const formRefValue = userFormRef?.value ?? userFormRef?.current ?? defaultFormRef.value
        formRefValue?.resetFields?.()
        // 同步更新请求参数
        const resetValues
          = formRefValue?.getFieldsFormatValue?.(true)
            ?? formRefValue?.getFieldsValue?.(true)
            ?? {}
        const nextSearch = beforeSearchSubmit
          ? beforeSearchSubmit(resetValues)
          : resetValues
        setFormSearchWithRef((nextSearch ?? {}) as any)
      },
      editableUtils,
      scrollTo: (arg: any) => antTableRef.value?.scrollTo?.(arg),
    } as any)

    /** 同步 action */
    counter.setAction(actionRef.value)

    // mirror: useImperativeHandle(propsActionRef, () => actionRef.current)
    watch(
      [actionRef, () => componentProps.proTableProps.actionRef],
      () => {
        const propsActionRef = componentProps.proTableProps.actionRef
        if (propsActionRef) {
          if (typeof propsActionRef === 'function') {
            (propsActionRef as (ref: ActionType | undefined) => void)(actionRef.value)
          }
          else {
            // mirror React useImperativeHandle: 同时支持 Vue Ref(.value) 与 React createRef({ current })
            (propsActionRef as Ref<ActionType | undefined>).value = actionRef.value
            ;(propsActionRef as unknown as { current?: ActionType }).current = actionRef.value
          }
        }
      },
      { immediate: true, flush: 'post' },
    )

    // ---------- 列计算相关 start  -----------------
    const tableColumn = computed(() => {
      const props = componentProps.proTableProps
      const columnContext: TableColumnContext<any> = {
        counter,
        columnEmptyText: props.columnEmptyText ?? '-',
        type: props.type ?? 'table',
        editableUtils,
        marginSM: themeToken.token.value.marginSM,
        rowKey: (props.rowKey ?? 'id') as any,
        childrenColumnName: props.expandable?.childrenColumnName ?? 'children',
        proFilter: proFilter.value,
        proSort: proSort.value,
      }
      return genProColumnToColumn<any>({
        columns: propsColumns.value,
        context: columnContext,
      }).sort(columnSort(counter.columnsMap ?? {}))
    })

    /** Table Column 变化的时候更新一下 */
    useDeepCompareEffectDebounce(
      () => {
        const cols = tableColumn.value
        if (cols && cols.length > 0) {
          const columnKeys = cols.map((item: any) =>
            genColumnKey(item.key, item.index),
          )
          counter.setSortKeyColumns(columnKeys)
        }
      },
      [tableColumn],
      ['render', 'formItemRender'],
      100,
    )

    /** 同步 Pagination，支持受控的 页码 和 pageSize */
    useDeepCompareEffect(() => {
      const propsPagination = componentProps.proTableProps.pagination
      const pageInfo = action.pageInfo
      const { current = pageInfo?.current, pageSize = pageInfo?.pageSize }
        = (propsPagination as TablePaginationConfig) || {}
      if (
        propsPagination
        && (current || pageSize)
        && (pageSize !== pageInfo?.pageSize || current !== pageInfo?.current)
      ) {
        action.setPageInfo({
          pageSize: pageSize || pageInfo.pageSize,
          current: current || pageInfo.current,
        })
      }
    }, [
      () => (componentProps.proTableProps.pagination as TablePaginationConfig)?.pageSize,
      () => (componentProps.proTableProps.pagination as TablePaginationConfig)?.current,
    ])

    /** 行选择相关的问题 */
    const handleRowSelectionChange = (keys: Key[], rows: any[], info: any) => {
      const propsRowSelection = componentProps.proTableProps.rowSelection
      if (propsRowSelection && propsRowSelection.onChange) {
        propsRowSelection.onChange(keys as any, rows, info)
      }
      setSelectedRowKeys(keys as any)
    }

    const rowSelection = computed<TableRowSelection | undefined>(() => {
      const propsRowSelection = componentProps.proTableProps.rowSelection
      if (propsRowSelection === false || propsRowSelection == null)
        return undefined
      return {
        selectedRowKeys: selectedRowKeys.value,
        ...propsRowSelection,
        onChange: handleRowSelectionChange,
      } as any
    })

    /** LightFilter（轻量筛选）时工具栏把 search 插到左侧 */
    const isLightFilter = computed<boolean>(() => {
      const search = componentProps.proTableProps.search
      return search !== false && search?.filterType === 'light'
    })

    const onFormSearchSubmit = useRefFunction((values: any): any => {
      const { options } = componentProps.proTableProps
      // 判断search.onSearch返回值决定是否更新formSearch
      if (options && options.search) {
        const { name = 'keyword' }
          = options.search === true ? {} : options.search
        const success = (options.search as OptionSearchProps)?.onSearch?.(
          counter.keyWords!,
        )
        if (success !== false) {
          setFormSearchWithRef({
            ...values,
            [name]: counter.keyWords,
          })
          return
        }
      }
      setFormSearchWithRef(values)
    })

    const loading = computed(() => {
      if (typeof action.loading === 'object') {
        return action.loading?.spinning || false
      }
      return action.loading
    })

    const selectedRows = computed<any[]>(() => {
      // eslint-disable-next-line ts/no-unused-expressions
      action.dataSource
      return (selectedRowKeys.value?.map(key =>
        preserveRecordsRef.value?.get(key),
      ) ?? []) as any[]
    })

    const hideToolbar = computed<boolean>(() => {
      const { options, headerTitle, toolBarRender, toolbar } = componentProps.proTableProps
      return (
        options === false
        && !headerTitle
        && !toolBarRender
        && !toolbar
        && !isLightFilter.value
      )
    })

    const mergedDataSource = computed(() => {
      return getEditableDataSource<any>({
        dataSource: action.dataSource,
        editableUtils,
        pagination: pagination.value as any,
        getRowKey: getRowKey.value,
        childrenColumnName:
          componentProps.proTableProps.expandable?.childrenColumnName || 'children',
      })
    })

    const columns = computed(() => {
      const loopFilter = (column: any[]): any[] => {
        return column
          .map((item) => {
            const columnKey = genColumnKey(item.key, item.index)
            const config = counter.columnsMap?.[columnKey]
            if (config && config.show === false) {
              return false
            }
            if (item.children) {
              return {
                ...item,
                children: loopFilter(item.children),
              }
            }
            return item
          })
          .filter(Boolean)
      }
      return loopFilter(tableColumn.value)
    })

    const useFilterColumns = computed(() => {
      const _columns: any[] = flattenColumns(columns.value)
      return _columns.filter(column => !!column.filters)
    })

    const onSortChange = (sortConfig?: Record<string, SortOrder>) => {
      if (isDeepEqualReact(sortConfig, proSort.value))
        return
      proSort.value = sortConfig ?? {}
    }

    const onFilterChange = (filterConfig: Record<string, FilterValue>) => {
      if (isDeepEqualReact(filterConfig, proFilter.value))
        return
      proFilter.value = filterConfig ?? {}
    }

    const handleTableChange = (
      changePagination: TablePaginationConfig,
      filters: Record<string, AntFilterValue | null>,
      sorter: SorterResult<any> | SorterResult<any>[],
      extra: TableCurrentDataSource<any>,
    ) => {
      componentProps.proTableProps.onChange?.(changePagination, filters, sorter, extra)
      const serverFilter = getServerFilterResult(filters, useFilterColumns.value)
      onFilterChange(omitUndefined(serverFilter) as any)
      const serverSorter = getServerSorterResult(sorter)
      onSortChange(omitUndefined(serverSorter) as any)
    }

    const isFillHeight = computed(() => (componentProps.proTableProps as any).scroll?.y === 'fill')

    const resolvedRest = computed(() => {
      const {
        cardBordered: _cardBordered,
        request: _request,
        className: _className,
        params: _params,
        defaultData: _defaultData,
        headerTitle: _headerTitle,
        postData: _postData,
        ghost: _ghost,
        pagination: _pagination,
        actionRef: _actionRef,
        toolBarRender: _toolBarRender,
        optionsRender: _optionsRender,
        onLoad: _onLoad,
        onRequestError: _onRequestError,
        style: _style,
        cardProps: _cardProps,
        tableStyle: _tableStyle,
        tableClassName: _tableClassName,
        options: _options,
        search: _search,
        name: _name,
        onLoadingChange: _onLoadingChange,
        rowSelection: _rowSelection,
        beforeSearchSubmit: _beforeSearchSubmit,
        tableAlertRender: _tableAlertRender,
        tableAlertOptionRender: _tableAlertOptionRender,
        defaultClassName: _defaultClassName,
        formRef: _formRef,
        type: _type,
        columnEmptyText: _columnEmptyText,
        toolbar: _toolbar,
        rowKey: _rowKey,
        manualRequest: _manualRequest,
        polling: _polling,
        tooltip: _tooltip,
        revalidateOnFocus: _revalidateOnFocus,
        searchFormRender: _searchFormRender,
        columns: _columns,
        columnsState: _columnsState,
        loading: _loading,
        dataSource: _dataSource,
        onDataSourceChange: _onDataSourceChange,
        debounceTime: _debounceTime,
        editable: _editable,
        ErrorBoundary: _ErrorBoundary,
        tableRender: _tableRender,
        tableViewRender: _tableViewRender,
        tableExtraRender: _tableExtraRender,
        onChange: _onChange,
        onReset: _onReset,
        onSubmit: _onSubmit,
        form: _form,
        dateFormatter: _dateFormatter,
        defaultSize: _defaultSize,
        size: _size,
        onSizeChange: _onSizeChange,
        ...rest
      } = componentProps.proTableProps as any

      if (!isFillHeight.value)
        return rest
      const { scroll, ...otherRest } = rest as any
      const { y: _y, ...restScroll } = scroll || {}
      return { ...otherRest, scroll: { ...restScroll, y: '100%' } }
    })

    const mergedTableProps = computed(() => ({
      ...resolvedRest.value,
      size: counter.tableSize,
      class: componentProps.proTableProps.tableClassName,
      style: componentProps.proTableProps.tableStyle,
      loading: action.loading,
      dataSource: mergedDataSource.value,
      pagination: pagination.value,
      columns: columns.value,
      rowSelection: rowSelection.value,
      onChange: handleTableChange,
    }))

    return () => {
      const props = componentProps.proTableProps
      const defaultClassName = props.defaultClassName

      const className = clsx(defaultClassName, props.className, hashId, {
        [`${defaultClassName}-fill-height`]: isFillHeight.value,
      })

      const isEditorTable = props.name
      const notNeedCardDom = props.search === false && hideToolbar.value

      const searchNode: VNodeChild = (
        <TableSearch
          search={props.search}
          type={props.type}
          pagination={pagination.value}
          beforeSearchSubmit={props.beforeSearchSubmit}
          actionRef={actionRef}
          columns={propsColumns.value}
          onFormSearchSubmit={(values: any) => onFormSearchSubmit(values)}
          ghost={props.ghost}
          onReset={props.onReset}
          onSubmit={props.onSubmit}
          loading={!!loading.value}
          manualRequest={props.manualRequest}
          form={props.form}
          formRef={(props.formRef as any) || defaultFormRef}
          cardBordered={props.cardBordered}
          dateFormatter={props.dateFormatter}
          searchFormRender={props.searchFormRender}
          proTableProps={props}
        />
      )

      const toolbarDom: VNodeChild = (
        <TableToolbar
          toolBarRender={props.toolBarRender}
          headerTitle={props.headerTitle}
          hideToolbar={hideToolbar.value}
          selectedRows={selectedRows.value}
          selectedRowKeys={selectedRowKeys.value as any}
          tableColumn={tableColumn.value}
          tooltip={props.tooltip}
          toolbar={props.toolbar}
          isLightFilter={isLightFilter.value}
          searchNode={searchNode}
          options={props.options}
          optionsRender={props.optionsRender}
          actionRef={actionRef}
          setFormSearch={setFormSearchWithRef as any}
          formSearch={formSearch.value}
        />
      )

      const alertDom: VNodeChild
        = props.rowSelection === false || props.rowSelection == null
          ? null
          : (
              <TableAlert
                selectedRowKeys={selectedRowKeys.value as any}
                selectedRows={selectedRows.value}
                onCleanSelected={onCleanSelected}
                alertOptionRender={props.tableAlertOptionRender}
                alertInfoRender={props.tableAlertRender}
                alwaysShowAlert={props.rowSelection?.alwaysShowAlert}
              />
            )

      const getBaseTableDom = () => (
        <GridContextProvider>
          <Table {...mergedTableProps.value} rowKey={props.rowKey} ref={antTableRef} />
        </GridContextProvider>
      )

      const tableDom = props.tableViewRender
        ? props.tableViewRender({ ...mergedTableProps.value }, getBaseTableDom)
        : getBaseTableDom()

      const tableContentDom
        = props.editable && !isEditorTable
          ? (
              <>
                {toolbarDom}
                {alertDom}
                <ProForm
                  {...(props.editable.formProps as any)}
                  formRef={(props.editable.formProps as any)?.formRef}
                  component={false}
                  form={props.editable.form}
                  onValuesChange={(editableUtils as any).onValuesChange}
                  key="table"
                  submitter={false}
                  omitNil={false}
                  dateFormatter={props.dateFormatter}
                >
                  {tableDom}
                </ProForm>
              </>
            )
          : (
              <>
                {toolbarDom}
                {alertDom}
                {tableDom}
              </>
            )

      const cardBodyStyle = getTableCardBodyStyle({
        propsCardProps: props.cardProps,
        notNeedCardDom,
        name: props.name,
        hideToolbar: hideToolbar.value,
        toolbarDom,
      })

      const useCardForTable
        = props.cardProps !== false && !props.name && !notNeedCardDom
      const useCardForList = props.cardProps !== false && props.type === 'list'
      const useCard = useCardForTable || useCardForList

      const resolvedCardProps = props.cardProps === false ? {} : (props.cardProps ?? {})

      const tableAreaDom: VNodeChild = useCard
        ? (
            <ProCard
              {...resolvedCardProps}
              ghost={props.ghost}
              variant={isBordered('table', props.cardBordered) ? 'outlined' : 'borderless'}
              styles={{
                body: {
                  ...cardBodyStyle,
                  ...(resolvedCardProps.styles?.body ?? {}),
                },
                header: resolvedCardProps.styles?.header,
              }}
            >
              {tableContentDom}
            </ProCard>
          )
        : (
            tableContentDom
          )

      const renderTable = (): VNodeChild => {
        if (props.tableRender) {
          return props.tableRender(props, tableAreaDom!, {
            toolbar: toolbarDom || undefined,
            alert: alertDom || undefined,
            table: tableDom || undefined,
          })
        }
        return tableAreaDom
      }

      const proTableDom = (
        <div
          class={clsx(className, {
            [`${defaultClassName}-polling`]: action.pollingLoading,
          })}
          style={props.style as any}
          ref={counter.rootDomRef}
          data-testid="pro-table"
        >
          {isLightFilter.value ? null : searchNode}
          {props.type !== 'form' && props.tableExtraRender && (
            <div class={clsx(className, `${defaultClassName}-extra`)}>
              {props.tableExtraRender(props, action.dataSource || [])}
            </div>
          )}
          {props.type !== 'form' && renderTable()}
        </div>
      )

      if (!props.options || !props.options?.fullScreen) {
        return wrapSSR(proTableDom)
      }
      return wrapSSR(
        <ConfigProvider
          getPopupContainer={() => {
            return (counter.rootDomRef.value || document.body) as any
          }}
        >
          {proTableDom}
        </ConfigProvider>,
      )
    }
  },
})

/**
 * 内部用于在 Table 周围注入 grid=false 的 GridContext。
 * mirror: <GridContext.Provider value={{ grid: false, ... }}>
 */
const GridContextProvider = defineComponent({
  name: 'TableGridContextProvider',
  setup(_, { slots }) {
    // mirror: <GridContext.Provider value={{ grid: false, ... }}>
    provide(GridContext, {
      grid: false,
      colProps: undefined,
      rowProps: undefined,
    } as any)
    return () => slots.default?.()
  },
})

const PassthroughFragment = defineComponent({
  name: 'PassthroughFragment',
  setup(_, { slots }) {
    return () => slots.default?.()
  },
})

/**
 * 🏆 Use Ant Design Table like a Pro! 更快 更好 更方便
 */
const ProviderTableContainer = defineComponent({
  name: 'ProTableContainer',
  inheritAttrs: false,
  setup(_, { attrs }) {
    const config = useConfig()
    const context = useProProviderContext()

    return () => {
      const props = attrs as unknown as ProTableProps<any, any, any>
      const ErrorComponent
        = (props.ErrorBoundary === false
          ? PassthroughFragment
          : props.ErrorBoundary || ErrorBoundary) as any

      const defaultClassName = `${config.value.getPrefixCls('pro-table')}`

      return (
        <TableProvider
          initValue={{
            ...(props as any),
            columnsState: props.columnsState,
            columns: props.columns,
            onSizeChange: props.onSizeChange,
            size: (props.size as any) || undefined,
            defaultSize: (props.defaultSize as any) || undefined,
          }}
        >
          <ProConfigProvider
            valueTypeMap={{ ...context.valueTypeMap, ...ValueTypeToComponent }}
            needDeps
          >
            <ErrorComponent>
              <ProTable
                proTableProps={{ ...(props as any), defaultClassName }}
              />
            </ErrorComponent>
          </ProConfigProvider>
        </TableProvider>
      )
    }
  },
}) as any

;(ProviderTableContainer as any).Summary = (Table as any).Summary

export default ProviderTableContainer
export { ProviderTableContainer as ProTable }
