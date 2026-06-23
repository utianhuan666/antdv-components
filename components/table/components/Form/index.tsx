import type { TablePaginationConfig } from 'antdv-next'
import type { Ref } from 'vue'
import type { ActionType, ProTableProps } from '../../typing'
import { omit } from '@v-c/util'
import { computed, defineComponent } from 'vue'
import { omitUndefined, useRefFunction } from '../../../utils'
import { isBordered } from '../../utils/index'
import FormRender from './FormRender'

export interface BaseFormProps<T, U> {
  pagination?: TablePaginationConfig | false
  beforeSearchSubmit?: (params: Partial<U>) => any
  action: Ref<ActionType | undefined>
  onSubmit?: (params: U) => void
  onReset?: () => void
  loading: boolean
  onFormSearchSubmit: (params: U) => void
  columns: ProTableProps<T, U, any>['columns']
  dateFormatter: ProTableProps<T, U, any>['dateFormatter']
  formRef: ProTableProps<T, U, any>['formRef']
  type: ProTableProps<T, U, any>['type']
  cardBordered: ProTableProps<T, U, any>['cardBordered']
  form: ProTableProps<T, U, any>['form']
  search: ProTableProps<T, U, any>['search']
  manualRequest: ProTableProps<T, U, any>['manualRequest']
  ghost?: boolean
}

interface FormSearchProps {
  pagination?: TablePaginationConfig | false
  beforeSearchSubmit?: (params: any) => any
  action: Ref<ActionType | undefined>
  onSubmit?: (params: any) => void
  onReset?: () => void
  loading?: boolean
  onFormSearchSubmit: (params: any) => void
  columns?: ProTableProps<any, any, any>['columns']
  dateFormatter?: ProTableProps<any, any, any>['dateFormatter']
  formRef?: ProTableProps<any, any, any>['formRef']
  type?: ProTableProps<any, any, any>['type']
  cardBordered?: ProTableProps<any, any, any>['cardBordered']
  form?: ProTableProps<any, any, any>['form']
  search?: ProTableProps<any, any, any>['search']
  manualRequest?: boolean
  ghost?: boolean
}

/** 查询表单相关的配置 */
const FormSearch = defineComponent<FormSearchProps>({
  name: 'TableFormSearch',
  props: ['pagination', 'beforeSearchSubmit', 'action', 'onSubmit', 'onReset', 'loading', 'onFormSearchSubmit', 'columns', 'dateFormatter', 'formRef', 'type', 'cardBordered', 'form', 'search', 'manualRequest', 'ghost'],
  setup(rawProps) {
    const props = rawProps
    // 只传入 pagination 中的 current 和 pageSize 参数
    const pageInfo = computed(() =>
      props.pagination
        ? omitUndefined({
            current: (props.pagination as TablePaginationConfig).current,
            pageSize: (props.pagination as TablePaginationConfig).pageSize,
          })
        : {},
    )

    const onSubmitHandler = useRefFunction((value: any, firstLoad: boolean) => {
      const runSubmit = () => {
        const submitParams = { ...value, _timestamp: Date.now(), ...pageInfo.value }
        const beforeSearchSubmit
          = props.beforeSearchSubmit ?? ((searchParams: any) => searchParams)
        const omitParams = omit(
          beforeSearchSubmit(submitParams),
          Object.keys(pageInfo.value!),
        )
        props.onFormSearchSubmit(omitParams)
        if (!firstLoad) {
          // 不是第一次提交才跳回第一页，并触发 onSubmit
          props.action.value?.setPageInfo?.({ current: 1 })
          props.onSubmit?.(value)
        }
      }

      if (props.form?.ignoreRules === false && firstLoad) {
        // 首次提交时需要先通过校验再执行
        props.formRef?.value
          ?.validateFields()
          .then(runSubmit)
          .catch(() => {})
        return
      }
      runSubmit()
    })

    const onResetHandler = useRefFunction((value: any) => {
      const resetLogic = () => {
        const beforeSearchSubmit
          = props.beforeSearchSubmit ?? ((searchParams: any) => searchParams)
        const omitParams = omit(
          beforeSearchSubmit({ ...value, ...pageInfo.value }),
          Object.keys(pageInfo.value!),
        )
        props.onFormSearchSubmit(omitParams)
        // back first page
        props.action.value?.setPageInfo?.({
          current: 1,
        })
        props.onReset?.()
      }

      if (props.form?.ignoreRules === false) {
        props.formRef?.value
          ?.validateFields()
          .then(resetLogic)
          .catch(() => {})
        return
      }
      resetLogic()
    })

    return () => (
      <FormRender
        submitButtonLoading={props.loading}
        columns={props.columns!}
        type={props.type}
        ghost={props.ghost}
        formRef={props.formRef!}
        onSubmit={onSubmitHandler}
        manualRequest={props.manualRequest}
        onReset={onResetHandler}
        dateFormatter={props.dateFormatter}
        search={props.search}
        form={{
          autoFocusFirstInput: false,
          ...props.form,
          extraUrlParams: {
            ...pageInfo.value,
            ...props.form?.extraUrlParams,
          },
        }}
        action={props.action}
        bordered={isBordered('search', props.cardBordered)}
      />
    )
  },
})

export default FormSearch
