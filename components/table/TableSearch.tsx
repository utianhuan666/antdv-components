import type { PropType, Ref, VNodeChild } from 'vue'
import type { ParamsType } from '../provider'
import type { ActionType, ProTableProps } from './typing'
import { defineComponent } from 'vue'
import FormRender from './components/Form'

export type TableSearchProps<T extends Record<string, any>, U, ValueType> = {
  search: ProTableProps<T, U, ValueType>['search']
  type: ProTableProps<T, U, ValueType>['type']
  pagination: ProTableProps<T, U, ValueType>['pagination']
  beforeSearchSubmit: ProTableProps<T, U, ValueType>['beforeSearchSubmit']
  actionRef: Ref<ActionType | undefined>
  columns: ProTableProps<T, U, ValueType>['columns']
  onFormSearchSubmit: <Y extends ParamsType>(values: Y) => any
  ghost: ProTableProps<T, U, ValueType>['ghost']
  onReset: ProTableProps<T, U, ValueType>['onReset']
  onSubmit: ProTableProps<T, U, ValueType>['onSubmit']
  loading: boolean
  manualRequest: ProTableProps<T, U, ValueType>['manualRequest']
  form: ProTableProps<T, U, ValueType>['form']
  formRef: Ref<any>
  cardBordered: ProTableProps<T, U, ValueType>['cardBordered']
  dateFormatter: ProTableProps<T, U, ValueType>['dateFormatter']
  searchFormRender: ProTableProps<T, U, ValueType>['searchFormRender']
  proTableProps: ProTableProps<T, U, ValueType>
}

export const TableSearch = defineComponent({
  name: 'TableSearch',
  props: {
    search: { type: [Object, Boolean] as PropType<ProTableProps<any, any, any>['search']>, default: undefined },
    type: { type: String as PropType<ProTableProps<any, any, any>['type']>, default: undefined },
    pagination: { type: [Object, Boolean] as PropType<ProTableProps<any, any, any>['pagination']>, default: undefined },
    beforeSearchSubmit: { type: Function as PropType<ProTableProps<any, any, any>['beforeSearchSubmit']>, default: undefined },
    actionRef: { type: Object as PropType<Ref<ActionType | undefined>>, required: true },
    columns: { type: Array as PropType<ProTableProps<any, any, any>['columns']>, default: () => [] },
    onFormSearchSubmit: { type: Function as PropType<(values: any) => any>, required: true },
    ghost: { type: Boolean, default: undefined },
    onReset: { type: Function as PropType<ProTableProps<any, any, any>['onReset']>, default: undefined },
    onSubmit: { type: Function as PropType<ProTableProps<any, any, any>['onSubmit']>, default: undefined },
    loading: { type: Boolean, default: false },
    manualRequest: { type: Boolean, default: undefined },
    form: { type: Object as PropType<ProTableProps<any, any, any>['form']>, default: undefined },
    formRef: { type: Object as PropType<Ref<any>>, default: undefined },
    cardBordered: { type: [Boolean, Object] as PropType<ProTableProps<any, any, any>['cardBordered']>, default: undefined },
    dateFormatter: { type: [String, Function, Boolean] as PropType<ProTableProps<any, any, any>['dateFormatter']>, default: undefined },
    searchFormRender: { type: Function as PropType<ProTableProps<any, any, any>['searchFormRender']>, default: undefined },
    proTableProps: { type: Object as PropType<ProTableProps<any, any, any>>, required: true },
  },
  setup(props) {
    return () => {
      const node: VNodeChild
        = props.search === false && props.type !== 'form'
          ? null
          : (
              <FormRender
                pagination={props.pagination}
                beforeSearchSubmit={props.beforeSearchSubmit}
                action={props.actionRef}
                columns={props.columns}
                onFormSearchSubmit={(values: any) => {
                  props.onFormSearchSubmit(values as any)
                }}
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
        return <>{props.searchFormRender(props.proTableProps, node)}</>

      return node
    }
  },
})

export default TableSearch
