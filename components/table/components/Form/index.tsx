import type { ProColumns, ProTableProps, SearchConfig } from '../../typing'
import { defineComponent, nextTick, shallowRef } from 'vue'
import { getValueByNamePath, omitUndefined } from '../../../utils'
import { isBordered } from '../../utils'
import FormRender from './FormRender'

interface BaseFormProps<T = any, U = any> {
  pagination?: ProTableProps<T, U>['pagination']
  beforeSearchSubmit?: (params: Partial<U>) => any
  action: ProTableProps<T, U>['actionRef']
  onSubmit?: (params: U) => void
  onReset?: () => void
  loading: boolean
  onFormSearchSubmit: (params: U) => void
  columns: ProColumns<T>[]
  dateFormatter: ProTableProps<T, U>['dateFormatter']
  formRef: ProTableProps<T, U>['formRef']
  type: ProTableProps<T, U>['type']
  cardBordered: ProTableProps<T, U>['cardBordered']
  form: ProTableProps<T, U>['form']
  search: false | SearchConfig
  manualRequest: ProTableProps<T, U>['manualRequest']
  ghost?: boolean
}

function omitKeys<T extends Record<string, any>>(object: T, keys: string[]) {
  const next = { ...(object || {}) }
  keys.forEach(key => delete next[key])
  return next
}

function getRefValue(target: any) {
  if (!target)
    return undefined
  return 'value' in target ? target.value : target.current
}

function fieldName(item: Record<string, any>) {
  return item.name || item.key || item.dataIndex
}

function isEmptyValue(value: any) {
  return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)
}

async function validateForm(formRef: any, nameList?: any[]) {
  await nextTick()
  await nextTick()
  await new Promise<void>(resolve => setTimeout(resolve, 0))
  const form = getRefValue(formRef)
  if (form?.formInstance?.validateFields)
    return form.formInstance.validateFields(nameList)
  if (form?.validateFields)
    return form.validateFields(nameList)
  return form?.validateFieldsReturnFormatValue?.(nameList)
}

const FormSearch = defineComponent({
  name: 'TableSearchForm',
  props: [
    'columns',
    'loading',
    'formRef',
    'type',
    'action',
    'cardBordered',
    'dateFormatter',
    'form',
    'search',
    'pagination',
    'ghost',
    'manualRequest',
    'beforeSearchSubmit',
    'onSubmit',
    'onFormSearchSubmit',
    'onReset',
  ],
  setup(rawProps) {
    const props = rawProps as BaseFormProps<Record<string, any>, Record<string, any>>
    const innerFormRef = shallowRef<any>()

    function getFormRef() {
      return props.formRef || innerFormRef
    }

    function getValidateNameList() {
      return (props.columns || [])
        .filter((item: any) => item && item.search !== false && !item.hideInSearch)
        .map((item: any) => fieldName(item))
        .filter((name: any) => name !== undefined)
    }

    async function validateRequiredColumns() {
      if (props.form?.ignoreRules !== false)
        return

      const form = getRefValue(getFormRef())
      const values = form?.getFieldsValue?.(true) || form?.getFieldsValue?.() || {}
      const fields = (props.columns || [])
        .filter((item: any) => item && item.search !== false && !item.hideInSearch)
        .map((item: any) => {
          const name = fieldName(item)
          if (name === undefined)
            return undefined
          const formItemProps = typeof item.formItemProps === 'function'
            ? item.formItemProps(form, item)
            : item.formItemProps
          const rules = formItemProps?.rules || []
          const requiredRule = rules.find((rule: any) => rule?.required) || (formItemProps?.required ? { required: true } : undefined)
          if (!requiredRule || !isEmptyValue(getValueByNamePath(values, name)))
            return undefined
          return {
            name,
            errors: [requiredRule.message || 'Required'],
          }
        })
        .filter(Boolean)

      if (!fields.length)
        return

      form?.setFields?.(fields)
      await nextTick()
      throw fields
    }

    function getPageInfo() {
      return props.pagination
        ? omitUndefined({
          current: (props.pagination as any).current,
          pageSize: (props.pagination as any).pageSize,
        }) || {}
        : {}
    }

    async function validateIfNeeded(firstLoad?: boolean) {
      if (props.form?.ignoreRules !== false)
        return true
      if (!firstLoad && firstLoad !== undefined)
        return true
      try {
        await validateForm(getFormRef(), getValidateNameList())
        await validateRequiredColumns()
        return true
      }
      catch {
        return false
      }
    }

    async function onSubmitHandler(value: Record<string, any>, firstLoad: boolean) {
      if (!(await validateIfNeeded(firstLoad)))
        return

      const pageInfo = getPageInfo()
      const beforeSearchSubmit = props.beforeSearchSubmit || ((params: Partial<Record<string, any>>) => params)
      const submitParams = { ...value, _timestamp: Date.now(), ...pageInfo }
      const omitParams = omitKeys(beforeSearchSubmit(submitParams) || {}, Object.keys(pageInfo))
      props.onFormSearchSubmit?.(omitParams)

      if (!firstLoad) {
        getRefValue(props.action)?.setPageInfo?.({ current: 1 })
        props.onSubmit?.(value)
      }
    }

    async function onResetHandler(value: Record<string, any>) {
      if (props.form?.ignoreRules === false) {
        try {
          await validateForm(getFormRef(), getValidateNameList())
          await validateRequiredColumns()
        }
        catch {
          return
        }
      }

      const pageInfo = getPageInfo()
      const beforeSearchSubmit = props.beforeSearchSubmit || ((params: Partial<Record<string, any>>) => params)
      const omitParams = omitKeys(beforeSearchSubmit({ ...value, ...pageInfo }) || {}, Object.keys(pageInfo))
      props.onFormSearchSubmit?.(omitParams)
      getRefValue(props.action)?.setPageInfo?.({ current: 1 })
      props.onReset?.()
    }

    return () => (
      <FormRender
        submitButtonLoading={props.loading}
        columns={props.columns || []}
        type={props.type}
        ghost={props.ghost}
        formRef={getFormRef()}
        onSubmit={onSubmitHandler}
        manualRequest={props.manualRequest}
        onReset={onResetHandler}
        dateFormatter={props.dateFormatter}
        search={props.search}
        form={{
          autoFocusFirstInput: false,
          ...(props.form || {}),
          extraUrlParams: {
            ...getPageInfo(),
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
