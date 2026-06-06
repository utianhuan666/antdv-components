import type { VNodeChild } from 'vue'
import type { ActionType, ProTableProps } from './typing'
import { defineComponent } from 'vue'
import FormRender from './components/Form'

export interface TableSearchProps<T extends Record<string, any>, U, ValueType> {
  search: ProTableProps<T, U, ValueType>['search']
  type: ProTableProps<T, U, ValueType>['type']
  pagination: ProTableProps<T, U, ValueType>['pagination']
  beforeSearchSubmit: ProTableProps<T, U, ValueType>['beforeSearchSubmit']
  action?: { value?: ActionType, current?: ActionType }
  actionRef?: { value?: ActionType, current?: ActionType }
  columns: ProTableProps<T, U, ValueType>['columns']
  onFormSearchSubmit: (values: Record<string, any>) => any
  ghost: ProTableProps<T, U, ValueType>['ghost']
  onReset: ProTableProps<T, U, ValueType>['onReset']
  onSubmit: ProTableProps<T, U, ValueType>['onSubmit']
  loading: boolean
  manualRequest: ProTableProps<T, U, ValueType>['manualRequest']
  form: ProTableProps<T, U, ValueType>['form']
  formRef: ProTableProps<T, U, ValueType>['formRef']
  cardBordered: ProTableProps<T, U, ValueType>['cardBordered']
  dateFormatter: ProTableProps<T, U, ValueType>['dateFormatter']
  searchFormRender?: ProTableProps<T, U, ValueType>['searchFormRender']
  proTableProps?: ProTableProps<T, U, ValueType>
}

export const TableSearch = defineComponent({
  name: 'TableSearch',
  props: [
    'search',
    'type',
    'pagination',
    'beforeSearchSubmit',
    'action',
    'actionRef',
    'columns',
    'onFormSearchSubmit',
    'ghost',
    'onReset',
    'onSubmit',
    'loading',
    'manualRequest',
    'form',
    'formRef',
    'cardBordered',
    'dateFormatter',
    'searchFormRender',
    'proTableProps',
  ],
  setup(rawProps) {
    const props = rawProps as TableSearchProps<Record<string, any>, Record<string, any>, any>

    return () => {
      const node: VNodeChild = props.search === false && props.type !== 'form'
        ? null
        : (
            <FormRender
              pagination={props.pagination}
              beforeSearchSubmit={props.beforeSearchSubmit}
              action={props.actionRef || props.action}
              columns={props.columns || []}
              onFormSearchSubmit={props.onFormSearchSubmit}
              ghost={props.ghost}
              onReset={props.onReset}
              onSubmit={props.onSubmit}
              loading={props.loading}
              manualRequest={props.manualRequest}
              search={props.search}
              form={props.form}
              formRef={props.formRef}
              type={props.type || 'table'}
              cardBordered={props.cardBordered}
              dateFormatter={props.dateFormatter}
            />
          )

      if (props.searchFormRender && node)
        return props.searchFormRender(props.proTableProps || (props as any), node)
      return node
    }
  },
})
