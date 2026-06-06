import type { VNodeChild } from 'vue'
import type { ActionType, ProTableProps } from './typing'
import { computed, defineComponent } from 'vue'
import ListToolBar from './components/ListToolBar'
import ToolBar from './components/ToolBar'

export interface TableToolbarProps<T extends Record<string, any>> {
  toolBarRender: ProTableProps<T>['toolBarRender']
  headerTitle: ProTableProps<T>['headerTitle']
  hideToolbar: boolean
  selectedRows: T[]
  selectedRowKeys: (string | number)[]
  tableColumn: any[]
  tooltip: ProTableProps<T>['tooltip']
  toolbar: ProTableProps<T>['toolbar']
  isLightFilter: boolean
  searchNode: VNodeChild
  options: ProTableProps<T>['options']
  optionsRender: ProTableProps<T>['optionsRender']
  actionRef: { value?: ActionType, current?: ActionType }
  setFormSearch: (value: Record<string, any> | ((value: Record<string, any> | undefined) => Record<string, any>)) => void
  formSearch: Record<string, any> | undefined
}

function getAction(actionRef: any) {
  return actionRef?.value || actionRef?.current
}

function normalizeNodeList(value: any) {
  if (Array.isArray(value))
    return value
  if (value === undefined || value === null || value === false)
    return []
  return [value]
}

export const TableToolbar = defineComponent({
  name: 'TableToolbar',
  props: [
    'toolBarRender',
    'headerTitle',
    'hideToolbar',
    'selectedRows',
    'selectedRowKeys',
    'tableColumn',
    'tooltip',
    'toolbar',
    'isLightFilter',
    'searchNode',
    'options',
    'optionsRender',
    'actionRef',
    'setFormSearch',
    'formSearch',
  ],
  setup(rawProps) {
    const props = rawProps as TableToolbarProps<Record<string, any>>

    const optionSearch = computed(() => {
      const options: any = props.options
      if (!options || !options.search)
        return false

      const defaultSearchConfig = {
        onSearch: (keyword: string) => {
          const search = options.search === true ? {} : options.search
          const success = search?.onSearch?.(keyword)
          if (success === false)
            return false

          getAction(props.actionRef)?.setPageInfo?.({ current: 1 })
          props.setFormSearch?.({
            ...(props.formSearch || {}),
            _timestamp: Date.now(),
            [search?.name || 'keyword']: keyword,
          })
          return undefined
        },
      }
      return options.search === true
        ? defaultSearchConfig
        : { ...defaultSearchConfig, ...options.search }
    })

    return () => {
      if (props.toolBarRender === false || props.hideToolbar)
        return null

      const settingsOptions = props.options && typeof props.options === 'object'
        ? { ...props.options, search: false }
        : props.options
      const actions = props.toolBarRender
        ? props.toolBarRender(getAction(props.actionRef), {
            selectedRows: props.selectedRows,
            selectedRowKeys: props.selectedRowKeys,
          })
        : []

      const settingsNode = (
        <ToolBar
          key="options"
          options={settingsOptions}
          optionsRender={props.optionsRender}
          actionRef={props.actionRef}
          tableColumn={props.tableColumn}
          selectedRows={props.selectedRows}
          selectedRowKeys={props.selectedRowKeys}
          setFormSearch={(value: any) => {
            getAction(props.actionRef)?.setPageInfo?.({ current: 1 })
            props.setFormSearch?.((previous: any) => {
              const next = typeof value === 'function' ? value(previous) : value
              return {
                ...(next || {}),
                _timestamp: Date.now(),
              }
            })
          }}
        />
      )

      return (
        <ListToolBar
          filter={props.isLightFilter ? props.searchNode : undefined}
          title={props.headerTitle}
          tooltip={props.tooltip as any}
          search={optionSearch.value || props.toolbar?.search}
          onSearch={(keyword: string) => {
            const search = optionSearch.value as any
            if (search?.onSearch)
              void search.onSearch(keyword)
          }}
          actions={normalizeNodeList(actions)}
          settings={[settingsNode]}
          {...(props.toolbar || {})}
        />
      )
    }
  },
})
