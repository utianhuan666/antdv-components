import type { TablePaginationConfig } from 'antdv-next'
import type {
  ActionType,
  FilterValue,
  PageInfo,
  ProTableProps,
  RequestData,
  SortOrder,
} from './typing'
import { ConfigProvider, Table } from 'antdv-next'
import { computed, defineComponent, nextTick, ref, shallowRef, watch, watchEffect } from 'vue'
import ProCard from '../card'
import { ProConfigProvider, useIntl } from '../provider'
import { useProPrefixCls } from '../provider/useProPrefixCls'
import { ErrorBoundary, omitUndefined, stableStringify, useEditableArray } from '../utils'
import Alert from './components/Alert'
import { createTableContainer, provideTableContext } from './Store/Provide'
import { TableSearch } from './TableSearch'
import { TableToolbar } from './TableToolbar'
import useFetchData, { setActionRef } from './useFetchData'
import {
  flattenColumns,
  genColumnKey,
  getServerFilterResult,
  isBordered,
  isLocalSorter,
  mergePagination,
  parseDataIndex,
  parseServerDefaultColumnConfig,
} from './utils'
import { columnSort } from './utils/columnSort'
import { genProColumnToColumn } from './utils/genProColumnToColumn'

function getRowKeyFn<T extends Record<string, any>>(rowKey: any, _name: any) {
  if (typeof rowKey === 'function')
    return rowKey
  const key = rowKey ?? 'id'
  return (record: T, index?: number) => {
    if (index === -1)
      return record?.[key]
    return record?.[key] ?? index?.toString()
  }
}

function getRefValue<T = any>(target: unknown): T | undefined {
  if (!target || typeof target !== 'object')
    return undefined
  if ('value' in target)
    return (target as { value?: T }).value
  return (target as { current?: T }).current
}

function getSorterKey(column: any) {
  const sorter = column?.sorter
  if (typeof sorter === 'string')
    return sorter
  return parseDataIndex(column?.dataIndex) || column?.key?.toString()
}

function getSorterMultiple(column: any) {
  const sorter = column?.sorter
  return typeof sorter === 'object' && sorter ? sorter.multiple : undefined
}

function getDefaultSortState(columns: any[]) {
  return flattenColumns(columns).reduce<Record<string, SortOrder>>((acc, column) => {
    if (!column?.sorter)
      return acc
    const key = getSorterKey(column)
    if (key && column.defaultSortOrder)
      acc[key] = column.defaultSortOrder
    return acc
  }, {})
}

function getSortState(sorter: any, previous: Record<string, SortOrder>, columns: any[]) {
  const items = (Array.isArray(sorter) ? sorter : [sorter]).filter(Boolean)
  const hasMultiple = items.some(item => getSorterMultiple(item.column))
  const multipleKeys = new Set(
    flattenColumns(columns)
      .filter(column => getSorterMultiple(column))
      .map(column => getSorterKey(column))
      .filter(Boolean),
  )
  const next: Record<string, SortOrder> = hasMultiple
    ? Object.fromEntries(Object.entries(previous).filter(([key]) => multipleKeys.has(key)))
    : {}

  items.forEach((item) => {
    const key = getSorterKey(item.column || {})
    if (!key)
      return
    if (item.order)
      next[key] = item.order
    else
      delete next[key]
  })

  return next
}

function getServerSortState(sortState: Record<string, SortOrder>, columns: any[]) {
  return flattenColumns(columns).reduce<Record<string, SortOrder>>((acc, column) => {
    if (!column?.sorter || isLocalSorter(column.sorter))
      return acc
    const key = getSorterKey(column)
    if (key && sortState[key])
      acc[key] = sortState[key]
    return acc
  }, {})
}

function sortLocalDataSource<T extends Record<string, any>>(dataSource: T[], columns: any[], sortState: Record<string, SortOrder>) {
  const sorters = flattenColumns(columns)
    .filter(column => column?.sorter && isLocalSorter(column.sorter))
    .map((column) => {
      const key = getSorterKey(column)
      const order = key ? sortState[key] : undefined
      const sorter = column.sorter
      const compare = typeof sorter === 'function' ? sorter : sorter?.compare
      return {
        compare,
        order,
        multiple: typeof sorter === 'object' ? sorter.multiple ?? 0 : 0,
      }
    })
    .filter(item => item.order && item.compare)
    .sort((a, b) => (b.multiple || 0) - (a.multiple || 0))

  if (!sorters.length)
    return dataSource

  return [...dataSource].sort((a, b) => {
    for (const sorter of sorters) {
      const result = sorter.compare(a, b)
      if (result)
        return sorter.order === 'ascend' ? result : -result
    }
    return 0
  })
}

function getEditableDataSource<T extends Record<string, any>>({
  dataSource,
  editableUtils,
  pagination,
}: {
  dataSource: T[]
  editableUtils: any
  pagination: ProTableProps<T>['pagination']
}) {
  const list = Array.isArray(dataSource) ? [...dataSource] : []
  const newLine = editableUtils?.newLineRecord
  if (!newLine?.defaultValue)
    return list
  if (newLine.options?.position === 'top')
    return [newLine.defaultValue, ...list.filter(item => item !== newLine.defaultValue)]
  const page = pagination && typeof pagination === 'object' ? pagination : undefined
  if (page?.current && page?.pageSize && page.pageSize <= list.length) {
    const index = page.current * page.pageSize - 1
    list.splice(index, 0, newLine.defaultValue)
    return list
  }
  if (!list.includes(newLine.defaultValue))
    list.push(newLine.defaultValue)
  return list
}

const ProTableImpl = defineComponent({
  name: 'ProTable',
  inheritAttrs: false,
  props: [
    'columns',
    'toolbar',
    'ghost',
    'params',
    'columnsState',
    'onSizeChange',
    'cardProps',
    'tableRender',
    'tableViewRender',
    'tableExtraRender',
    'searchFormRender',
    'request',
    'postData',
    'defaultData',
    'actionRef',
    'formRef',
    'toolBarRender',
    'optionsRender',
    'onLoad',
    'onLoadingChange',
    'onRequestError',
    'polling',
    'tableClassName',
    'tableStyle',
    'headerTitle',
    'tooltip',
    'options',
    'search',
    'form',
    'dateFormatter',
    'beforeSearchSubmit',
    'tableAlertRender',
    'tableAlertOptionRender',
    'rowSelection',
    'type',
    'onSubmit',
    'onReset',
    'columnEmptyText',
    'manualRequest',
    'editable',
    'onDataSourceChange',
    'cardBordered',
    'debounceTime',
    'revalidateOnFocus',
    'defaultSize',
    'name',
    'ErrorBoundary',
    'pagination',
    'loading',
    'dataSource',
    'rowKey',
    'size',
    'class',
    'style',
    'scroll',
    'tableLayout',
    'expandable',
    'onChange',
  ],
  setup(rawProps, { attrs }) {
    const props = rawProps as ProTableProps<Record<string, any>, Record<string, any>, any>
    const intl = useIntl()
    const prefixCls = useProPrefixCls('pro-table')
    const actionRef = shallowRef<ActionType>()
    const antTableRef = shallowRef<any>()
    type TableKey = string | number
    const selectedRowKeys = ref<TableKey[]>(((((props.rowSelection as any) && (props.rowSelection as any) !== false) ? (props.rowSelection as any).defaultSelectedRowKeys : []) ?? []) as TableKey[])
    const preserveRecords = new Map<TableKey, any>()
    const formSearch = ref<Record<string, any> | undefined>((props.manualRequest || props.search !== false) ? undefined : {})
    const tableFilter = ref<Record<string, FilterValue>>({})
    const proFilter = ref<Record<string, FilterValue>>({})
    const proSort = ref<Record<string, SortOrder>>({})
    const tableSort = ref<Record<string, SortOrder>>({})

    const counter = createTableContainer({
      get size() {
        return props.size as any
      },
      get defaultSize() {
        return props.defaultSize
      },
      get onSizeChange() {
        return props.onSizeChange
      },
      get columns() {
        return props.columns || []
      },
      get columnsState() {
        return props.columnsState
      },
    } as any)
    provideTableContext(counter)

    function resetColumnState() {
      const { sort, filter } = parseServerDefaultColumnConfig(flattenColumns(props.columns || []))
      tableSort.value = getDefaultSortState(props.columns || [])
      proSort.value = sort
      proFilter.value = filter
      tableFilter.value = flattenColumns(props.columns || []).reduce<Record<string, FilterValue>>((acc, column) => {
        const dataIndex = Array.isArray(column.dataIndex) ? column.dataIndex.join(',') : column.dataIndex?.toString()
        if (dataIndex && column.filters)
          acc[dataIndex] = (column.defaultFilteredValue as FilterValue) ?? null
        return acc
      }, {})
    }

    watchEffect(() => {
      resetColumnState()
    })

    const fetchData = computed(() => {
      if (!props.request)
        return undefined
      return async (pageParams?: Record<string, any>) => {
        const actionParams = {
          ...(pageParams || {}),
          ...(formSearch.value || {}),
          ...(props.params || {}),
        }
        delete actionParams._timestamp
        return await props.request!(
          actionParams as any,
          proSort.value,
          proFilter.value,
        ) as RequestData<Record<string, any>>
      }
    })

    const fetchPagination = computed(() => {
      if (typeof props.pagination === 'object')
        return props.pagination as TablePaginationConfig
      return { defaultCurrent: 1, defaultPageSize: 20, pageSize: 20, current: 1 }
    })

    const action = useFetchData<Record<string, any>>(
      fetchData.value,
      props.defaultData,
      {
        get dataSource() {
          return props.dataSource as any
        },
        get loading() {
          return props.loading as any
        },
        onDataSourceChange: props.onDataSourceChange as any,
        onLoad: props.onLoad,
        onLoadingChange: props.onLoadingChange,
        onRequestError: props.onRequestError,
        postData: props.postData as any,
        get revalidateOnFocus() {
          return props.revalidateOnFocus
        },
        get manual() {
          return formSearch.value === undefined
        },
        get polling() {
          return props.polling
        },
        get effects() {
          return [
            stableStringify(props.params || {}),
            stableStringify(formSearch.value || {}),
            stableStringify(proFilter.value),
            stableStringify(proSort.value),
          ]
        },
        get debounceTime() {
          return props.debounceTime
        },
        get pageInfo() {
          return props.pagination === false ? false : fetchPagination.value
        },
        onPageInfoChange: (pageInfo: PageInfo) => {
          if (!props.pagination || !fetchData.value) {
            return
          }
          ;(props.pagination as any)?.onChange?.(pageInfo.current, pageInfo.pageSize)
          ;(props.pagination as any)?.onShowSizeChange?.(pageInfo.current, pageInfo.pageSize)
        },
      } as any,
    )

    const getRowKey = computed(() => getRowKeyFn(props.rowKey, props.name))

    watch(
      () => action.dataSource,
      (list) => {
        list?.forEach((record, index) => preserveRecords.set(getRowKey.value(record, index), record))
      },
      { deep: true, immediate: true },
    )

    const pagination = computed(() => mergePagination(
      props.pagination as any,
      {
        ...action.pageInfo,
        setPageInfo: ({ pageSize, current }: PageInfo) => {
          if (pageSize === action.pageInfo.pageSize || action.pageInfo.current === 1) {
            action.setPageInfo({ pageSize, current })
            return
          }
          if (props.request)
            action.setDataSource([])
          action.setPageInfo({ pageSize, current: props.type === 'list' ? current : 1 })
        },
      },
      intl,
    ))

    const editableUtils = useEditableArray<Record<string, any>>({
      ...(props.editable || {}),
      get tableName() {
        return props.name as any
      },
      get columns() {
        return props.columns || []
      },
      get dataSource() {
        return action.dataSource
      },
      setDataSource: (data: any) => action.setDataSource(data),
      getRowKey: (record: Record<string, any>, index?: number) => getRowKey.value(record, index),
      childrenColumnName: (props.expandable as any)?.childrenColumnName || 'children',
    } as any)

    function cleanSelected() {
      ;(props.rowSelection as any) && (props.rowSelection as any) !== false && (props.rowSelection as any).onChange?.([], [], { type: 'none' } as any)
      selectedRowKeys.value = []
    }

    const coreAction = computed<ActionType>(() => ({
      ...editableUtils,
      pageInfo: action.pageInfo,
      nativeElement: counter.rootDomRef.value,
      focus: () => counter.rootDomRef.value?.focus(),
      reload: async (resetPageIndex?: boolean) => {
        if (resetPageIndex)
          await action.setPageInfo({ current: 1 })
        await action.reload()
      },
      reloadAndRest: async () => {
        cleanSelected()
        await action.setPageInfo({ current: 1 })
        await action.reload()
      },
      reset: async () => {
        cleanSelected()
        counter.setKeyWords(undefined)
        resetColumnState()
        const form = getRefValue<any>(props.formRef)
        if (form?.resetFields) {
          form.resetFields()
          await nextTick()
        }
        else {
          formSearch.value = {}
        }
        await action.reset()
        await action.reload()
      },
      clearSelected: cleanSelected,
      setPageInfo: (info: Partial<PageInfo>) => action.setPageInfo(info),
      fullScreen: () => {
        const el = counter.rootDomRef.value
        if (!el || typeof document === 'undefined')
          return
        if (document.fullscreenElement)
          document.exitFullscreen?.()
        else
          el.requestFullscreen?.()
      },
      scrollTo: (arg: any) => antTableRef.value?.scrollTo?.(arg),
    } as ActionType))

    watchEffect(() => {
      actionRef.value = coreAction.value
      counter.setAction(coreAction.value)
      counter.propsRef.value = props
      counter.setPrefixName(props.name)
      setActionRef(props.actionRef, coreAction.value)
    })

    const tableColumn = computed(() => {
      void (editableUtils.editableKeys || []).map((key: any) => String(key)).join(';')
      return genProColumnToColumn({
        columns: props.columns || [],
        context: {
          counter,
          columnEmptyText: props.columnEmptyText ?? '-',
          type: props.type || 'table',
          editableUtils,
          rowKey: getRowKey.value,
          childrenColumnName: (props.expandable as any)?.childrenColumnName ?? 'children',
          proFilter: proFilter.value,
          tableFilter: tableFilter.value,
          proSort: tableSort.value,
        },
      }).sort(columnSort(counter.columnsMap.value))
    })

    watch(tableColumn, (columns) => {
      counter.setSortKeyColumns(columns.map((item: any, index) => genColumnKey(item.key, index)))
    }, { immediate: true, deep: true })

    const visibleColumns = computed(() => {
      const loop = (columns: any[]): any[] => columns
        .map((column, index) => {
          const key = genColumnKey(column.key, column.index ?? index)
          const state = counter.columnsMap.value?.[key]
          if (state?.show === false)
            return false
          const next = { ...column, fixed: state?.fixed ?? column.fixed }
          if (next.children)
            next.children = loop(next.children)
          return next
        })
        .filter(Boolean)
      return loop(tableColumn.value)
    })

    const mergedSelectedRowKeys = computed(() => {
      const rowSelectionProps = props.rowSelection || {}
      return (((rowSelectionProps as any).selectedRowKeys ?? selectedRowKeys.value) || []) as TableKey[]
    })

    const rowSelection = computed(() => {
      if (!props.rowSelection || (props.rowSelection as any) === false)
        return undefined
      const rowSelectionProps = props.rowSelection || {}
      return {
        ...rowSelectionProps,
        selectedRowKeys: mergedSelectedRowKeys.value,
        onChange: (keys: TableKey[], rows: any[], info: any) => {
          selectedRowKeys.value = keys || []
          ;(rowSelectionProps as any).onChange?.(keys, rows, info)
        },
      }
    })

    const selectedRows = computed(() => mergedSelectedRowKeys.value.map(key => preserveRecords.get(key)).filter(Boolean))
    const isLightFilter = computed(() => props.search !== false && props.search?.filterType === 'light')
    const hideToolbar = computed(() => props.options === false && !props.headerTitle && !props.toolBarRender && !props.toolbar && !isLightFilter.value)

    function onFormSearchSubmit(values: Record<string, any>) {
      const options: any = props.options
      if (options && options.search) {
        const search = options.search === true ? {} : options.search
        const success = search.onSearch?.(counter.keyWords.value)
        if (success !== false) {
          formSearch.value = { ...values, [search.name || 'keyword']: counter.keyWords.value }
          return
        }
      }
      formSearch.value = values
    }

    const searchNode = computed(() => (
      <TableSearch
        search={props.search}
        type={props.type}
        pagination={pagination.value}
        beforeSearchSubmit={props.beforeSearchSubmit}
        action={actionRef}
        columns={props.columns || []}
        onFormSearchSubmit={onFormSearchSubmit}
        ghost={props.ghost}
        onReset={props.onReset}
        onSubmit={props.onSubmit}
        loading={Boolean(typeof action.loading === 'object' ? action.loading.spinning : action.loading)}
        manualRequest={props.manualRequest}
        form={props.form}
        formRef={props.formRef}
        cardBordered={props.cardBordered}
        dateFormatter={props.dateFormatter}
      />
    ))

    function handleTableChange(changePagination: any, filters: Record<string, any>, sorter: any, extra: any) {
      props.onChange?.(changePagination, filters, sorter, extra)
      tableFilter.value = omitUndefined(filters) || {}
      tableSort.value = omitUndefined(getSortState(sorter, tableSort.value, visibleColumns.value)) || {}
      proFilter.value = omitUndefined(getServerFilterResult(filters, flattenColumns(visibleColumns.value))) || {}
      proSort.value = omitUndefined(getServerSortState(tableSort.value, visibleColumns.value)) || {}
    }

    return () => {
      const className = [
        prefixCls.value,
        (props as any).class,
        (props.scroll as any)?.y === 'fill' ? `${prefixCls.value}-fill-height` : '',
        action.pollingLoading ? `${prefixCls.value}-polling` : '',
      ].filter(Boolean).join(' ')

      const toolbarDom = (
        <TableToolbar
          toolBarRender={props.toolBarRender}
          headerTitle={props.headerTitle}
          hideToolbar={hideToolbar.value}
          selectedRows={selectedRows.value}
          selectedRowKeys={mergedSelectedRowKeys.value}
          tableColumn={tableColumn.value}
          tooltip={props.tooltip}
          toolbar={props.toolbar}
          isLightFilter={isLightFilter.value}
          searchNode={searchNode.value}
          options={props.options}
          optionsRender={props.optionsRender}
          actionRef={actionRef}
          setFormSearch={(value: any) => {
            formSearch.value = typeof value === 'function' ? value(formSearch.value) : value
          }}
          formSearch={formSearch.value}
        />
      )
      const alertDom = (
        <Alert
          selectedRowKeys={mergedSelectedRowKeys.value as any}
          selectedRows={selectedRows.value}
          onCleanSelected={cleanSelected}
          alertOptionRender={props.tableAlertOptionRender}
          alertInfoRender={props.tableAlertRender}
          alwaysShowAlert={(props.rowSelection as any)?.alwaysShowAlert}
        />
      )
      const mergedDataSource = getEditableDataSource({
        dataSource: action.dataSource,
        editableUtils,
        pagination: pagination.value as any,
      })
      const sortedDataSource = sortLocalDataSource(mergedDataSource, visibleColumns.value, tableSort.value)
      const editableTableKey = (editableUtils.editableKeys || []).map((key: any) => String(key)).join(';')
      const restTableProps: Record<string, any> = {
        ...attrs,
        tableLayout: props.tableLayout,
        expandable: props.expandable,
        scroll: (props.scroll as any)?.y === 'fill'
          ? { ...(props.scroll as any), y: '100%' }
          : props.scroll,
      }
      const tableProps = {
        ...restTableProps,
        ref: antTableRef,
        rowKey: props.rowKey,
        size: counter.tableSize.value,
        class: props.tableClassName,
        style: props.tableStyle,
        loading: action.loading,
        dataSource: sortedDataSource,
        pagination: pagination.value,
        columns: visibleColumns.value,
        rowSelection: rowSelection.value,
        onChange: handleTableChange,
      }
      const baseTableDom = () => <Table key={editableTableKey} {...tableProps as any} />
      const tableDom = props.tableViewRender
        ? props.tableViewRender(tableProps as any, baseTableDom)
        : baseTableDom()
      const safeTableDom = <ErrorBoundary>{tableDom}</ErrorBoundary>

      const tableContentDom = props.editable && !props.name
        ? (
            <>
              {toolbarDom}
              {alertDom}
              {safeTableDom}
            </>
          )
        : (
            <>
              {toolbarDom}
              {alertDom}
              {safeTableDom}
            </>
          )
      const notNeedCardDom = props.search === false && hideToolbar.value
      const useCard = props.cardProps !== false && !props.name && !notNeedCardDom
      const tableAreaDom = useCard
        ? (
            <ProCard
              {...(props.cardProps || {}) as any}
              ghost={props.ghost}
              variant={isBordered('table', props.cardBordered) ? 'outlined' : 'borderless'}
              styles={{ body: { padding: toolbarDom ? '0 0 24px' : 0, ...((props.cardProps as any)?.styles?.body || {}) } }}
            >
              {tableContentDom}
            </ProCard>
          )
        : tableContentDom

      const renderedTable = props.tableRender
        ? props.tableRender(props, tableAreaDom, { toolbar: toolbarDom, alert: alertDom, table: tableDom })
        : tableAreaDom

      const body = (
        <div class={className} style={(props as any).style} ref={counter.rootDomRef} data-testid="pro-table" tabindex={-1}>
          {isLightFilter.value ? null : props.searchFormRender ? props.searchFormRender(props, searchNode.value) : searchNode.value}
          {props.type !== 'form' && props.tableExtraRender ? <div class={`${prefixCls.value}-extra`}>{props.tableExtraRender(props, action.dataSource)}</div> : null}
          {props.type !== 'form' ? renderedTable : null}
        </div>
      )

      const wrapped = (
        <ProConfigProvider>
          {body}
        </ProConfigProvider>
      )
      return props.options && (props.options as any).fullScreen
        ? <ConfigProvider getPopupContainer={() => counter.rootDomRef.value || document.body}>{wrapped}</ConfigProvider>
        : wrapped
    }
  },
})

const ProTable = ProTableImpl as typeof ProTableImpl & {
  Summary?: typeof Table.Summary
  new(): { $props: ProTableProps<any, any, any> }
}

ProTable.Summary = Table.Summary

export default ProTable
