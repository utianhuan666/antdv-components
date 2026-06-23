import type { TableColumnType } from 'antdv-next'
import type { PropType, Ref, VNodeChild } from 'vue'
import type { ActionType, Key, ProTableProps } from './typing'
import { defineComponent } from 'vue'
import Toolbar from './components/ToolBar'

export interface TableToolbarProps<T extends Record<string, any>> {
  toolBarRender: ProTableProps<T, any, any>['toolBarRender']
  headerTitle: ProTableProps<T, any, any>['headerTitle']
  hideToolbar: boolean
  selectedRows: T[]
  selectedRowKeys: (string | number | Key)[] | undefined
  tableColumn: (TableColumnType<T> & { index?: number })[]
  tooltip: ProTableProps<T, any, any>['tooltip']
  toolbar: ProTableProps<T, any, any>['toolbar']
  isLightFilter: boolean
  searchNode: VNodeChild
  options: ProTableProps<T, any, any>['options']
  optionsRender: ProTableProps<T, any, any>['optionsRender']
  actionRef: Ref<ActionType | undefined>
  setFormSearch: (value: Record<string, any> | undefined) => void
  formSearch: Record<string, any> | undefined
}

export const TableToolbar = defineComponent({
  name: 'TableToolbar',
  props: {
    toolBarRender: { type: [Function, Boolean] as PropType<ProTableProps<any, any, any>['toolBarRender'] | false>, default: undefined },
    headerTitle: { type: [Object, String, Number, Boolean, Array] as PropType<ProTableProps<any, any, any>['headerTitle']>, default: undefined },
    hideToolbar: { type: Boolean, default: false },
    selectedRows: { type: Array as PropType<any[]>, default: () => [] },
    selectedRowKeys: { type: Array as PropType<(string | number | Key)[] | undefined>, default: undefined },
    tableColumn: { type: Array as PropType<(TableColumnType<any> & { index?: number })[]>, default: () => [] },
    tooltip: { type: [String, Object] as PropType<ProTableProps<any, any, any>['tooltip']>, default: undefined },
    toolbar: { type: Object as PropType<ProTableProps<any, any, any>['toolbar']>, default: undefined },
    isLightFilter: { type: Boolean, default: false },
    searchNode: { type: [Object, String, Number, Boolean, Array] as PropType<VNodeChild>, default: undefined },
    options: { type: [Object, Boolean] as PropType<ProTableProps<any, any, any>['options']>, default: undefined },
    optionsRender: { type: Function as PropType<ProTableProps<any, any, any>['optionsRender']>, default: undefined },
    actionRef: { type: Object as PropType<Ref<ActionType | undefined>>, required: true },
    setFormSearch: { type: Function as PropType<(value: Record<string, any> | undefined) => void>, required: true },
    formSearch: { type: Object as PropType<Record<string, any> | undefined>, default: undefined },
  },
  setup(props) {
    return () => {
      if (props.toolBarRender === false)
        return null

      return (
        <Toolbar
          headerTitle={props.headerTitle}
          hideToolbar={props.hideToolbar}
          selectedRows={props.selectedRows}
          selectedRowKeys={props.selectedRowKeys! as (string | number)[]}
          tableColumn={props.tableColumn}
          tooltip={props.tooltip}
          toolbar={props.toolbar}
          onFormSearchSubmit={(newValues: any) => {
            props.setFormSearch({
              ...(props.formSearch || {}),
              ...newValues,
            })
          }}
          searchNode={props.isLightFilter ? props.searchNode : null}
          options={props.options}
          optionsRender={props.optionsRender}
          actionRef={props.actionRef}
          toolBarRender={props.toolBarRender as any}
        />
      )
    }
  },
})

export default TableToolbar
