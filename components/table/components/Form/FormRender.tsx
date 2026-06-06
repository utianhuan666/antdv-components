import type { Ref } from 'vue'
import type { ProColumns, ProTableProps, SearchConfig } from '../../typing'
import { Table } from 'antdv-next'
import { computed, defineComponent, ref, shallowRef } from 'vue'
import { BetaSchemaForm } from '../../../form'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import { getValueByNamePath, setValueByNamePath } from '../../../utils'
import { setActionRef } from '../../useFetchData'

function toLowerLine(str: string) {
  const result = str.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
  return result.startsWith('-') ? result.slice(1) : result
}

function omitKeys<T extends Record<string, any>>(object: T | undefined, keys: string[]) {
  const next = { ...(object || {}) }
  keys.forEach(key => delete next[key])
  return next
}

function fieldName(item: Record<string, any>) {
  return item.name || item.key || item.dataIndex
}

function normalizeFormItemProps(formItemProps: Record<string, any> | undefined) {
  if (!formItemProps)
    return formItemProps
  const { className, class: classProp, ...rest } = formItemProps
  if (className === undefined)
    return formItemProps
  return {
    ...rest,
    class: [classProp, className].filter(Boolean),
  }
}

export interface TableFormItem<T = any, U = any> {
  onSubmit?: (value: T, firstLoad: boolean) => void
  onReset?: (value: T) => void
  form?: ProTableProps<T, U>['form']
  type?: ProTableProps<T, U>['type']
  dateFormatter?: ProTableProps<T, U>['dateFormatter']
  search?: false | SearchConfig
  columns: ProColumns<U>[]
  formRef: Ref<any> | { current?: any } | undefined
  submitButtonLoading?: boolean
  manualRequest?: boolean
  bordered?: boolean
  action: Ref<any> | { current?: any } | undefined
  ghost?: boolean
}

function getFormCompetent(isForm: boolean, searchConfig?: SearchConfig | false): 'Form' | 'LightFilter' | 'QueryFilter' {
  if (!isForm && searchConfig !== false) {
    if ((searchConfig as any)?.filterType === 'light')
      return 'LightFilter'
    return 'QueryFilter'
  }
  return 'Form'
}

function getFromProps(isForm: boolean, searchConfig: any, name: string) {
  if (!isForm && name === 'LightFilter') {
    return omitKeys({ ...searchConfig }, ['labelWidth', 'defaultCollapsed', 'filterType'])
  }

  if (!isForm) {
    return omitKeys({
      labelWidth: searchConfig ? searchConfig?.labelWidth : undefined,
      defaultCollapsed: true,
      ...searchConfig,
    }, ['filterType'])
  }

  return {}
}

function getFormConfigs(isForm: boolean, formConfig: any) {
  if (isForm)
    return omitKeys(formConfig, ['ignoreRules'])
  return { ignoreRules: true, ...formConfig }
}

const FormRender = defineComponent({
  name: 'TableFormRender',
  props: [
    'onSubmit',
    'formRef',
    'dateFormatter',
    'type',
    'columns',
    'action',
    'ghost',
    'manualRequest',
    'onReset',
    'submitButtonLoading',
    'search',
    'form',
    'bordered',
  ],
  setup(rawProps) {
    const props = rawProps as TableFormItem<Record<string, any>, Record<string, any>>
    const innerFormRef = shallowRef<any>()
    const realFormRef = shallowRef<any>()
    const layoutFormRef = shallowRef<any>()
    const pendingValues = shallowRef<Record<string, any>>({})
    const pendingSubmit = shallowRef(false)
    const proxyRenderTick = ref(0)
    const searchPrefixCls = useProPrefixCls('pro-table-search')
    const formPrefixCls = useProPrefixCls('pro-table-form')
    const cardPrefixCls = useProPrefixCls('pro-card')
    const isForm = computed(() => props.type === 'form')
    const competentName = computed(() => getFormCompetent(isForm.value, props.search))

    const formProxy = computed(() => {
      const proxy = {
        get formInstance() {
          return realFormRef.value?.formInstance || layoutFormRef.value?.formInstance
        },
        get nativeElement() {
          return realFormRef.value?.nativeElement
        },
        submit() {
          if (realFormRef.value?.submit) {
            realFormRef.value.submit()
            return
          }
          pendingSubmit.value = true
        },
        reset() {
          proxy.resetFields()
        },
        resetFields() {
          const initialValues = getInitialValues()
          pendingValues.value = initialValues
          proxyRenderTick.value += 1
          if (realFormRef.value?.resetFields)
            realFormRef.value.resetFields()
          else
            realFormRef.value?.reset?.()
          realFormRef.value?.setFieldsValue?.(initialValues)
          const values = proxy.getFieldsFormatValue?.(true) ?? proxy.getFieldsValue?.(true) ?? {}
          props.onReset?.(values)
        },
        validateFields(nameList?: any) {
          if (realFormRef.value?.validateFields)
            return realFormRef.value.validateFields(nameList)
          if (realFormRef.value?.formInstance?.validateFields)
            return realFormRef.value.formInstance.validateFields(nameList)
          if (layoutFormRef.value?.formInstance?.validateFields)
            return layoutFormRef.value.formInstance.validateFields(nameList)
          if (realFormRef.value?.validateFieldsReturnFormatValue)
            return realFormRef.value.validateFieldsReturnFormatValue(nameList, false)
          return Promise.resolve(proxy.getFieldsValue())
        },
        validateFieldsReturnFormatValue(nameList?: any, omitNil?: boolean) {
          if (realFormRef.value?.validateFieldsReturnFormatValue)
            return realFormRef.value.validateFieldsReturnFormatValue(nameList, omitNil)
          return proxy.validateFields(nameList)
        },
        getFieldsValue(...args: any[]) {
          return {
            ...(realFormRef.value?.getFieldsValue?.(...args) || {}),
            ...pendingValues.value,
          }
        },
        getFieldValue(name: any) {
          if (Object.keys(pendingValues.value).length) {
            const pendingValue = getValueByNamePath(pendingValues.value, name)
            if (pendingValue !== undefined)
              return pendingValue
          }
          return realFormRef.value?.getFieldValue?.(name)
        },
        getFieldsFormatValue(...args: any[]) {
          return {
            ...pendingValues.value,
            ...(realFormRef.value?.getFieldsFormatValue?.(...args) || realFormRef.value?.getFieldsValue?.(...args) || {}),
          }
        },
        getFieldFormatValue(name: any, omitNil?: boolean) {
          const pendingValue = proxy.getFieldValue(name)
          if (pendingValue !== undefined)
            return pendingValue
          return realFormRef.value?.getFieldFormatValue?.(name, omitNil)
        },
        getFieldFormatValueObject(name: any, omitNil?: boolean) {
          return realFormRef.value?.getFieldFormatValueObject?.(name, omitNil)
        },
        setFieldsValue(values: Record<string, any>) {
          updatePendingValues(values || {})
          realFormRef.value?.setFieldsValue?.(values)
        },
        setFieldValue(name: any, value: any) {
          const nextValues = { ...pendingValues.value }
          setValueByNamePath(nextValues, name, value)
          pendingValues.value = nextValues
          proxyRenderTick.value += 1
          if (realFormRef.value?.setFieldValue)
            realFormRef.value.setFieldValue(name, value)
          else
            realFormRef.value?.setFieldsValue?.(setValueByNamePath({}, name, value))
        },
        setFields(fields: any[]) {
          if (realFormRef.value?.setFields)
            realFormRef.value.setFields(fields)
          else if (realFormRef.value?.formInstance?.setFields)
            realFormRef.value.formInstance.setFields(fields)
          else
            layoutFormRef.value?.formInstance?.setFields?.(fields)
        },
      }
      return proxy
    })

    const columnsList = computed(() => {
      void proxyRenderTick.value
      return (props.columns || [])
        .filter((item: any) => {
          if (item === (Table as any).EXPAND_COLUMN || item === (Table as any).SELECTION_COLUMN)
            return false
          if ((item.search === false || item.hideInSearch) && props.type !== 'form')
            return false
          if (props.type === 'form' && item.hideInForm)
            return false
          return true
        })
        .map((item: any, index) => {
          const finalValueType = !item.valueType
            || (['textarea', 'jsonCode', 'code'].includes(item.valueType) && props.type === 'table')
            ? 'text'
            : item.valueType
          const columnKey = item?.key || (Array.isArray(item?.dataIndex) ? item.dataIndex.join('.') : item?.dataIndex?.toString())

          const searchProps = item.search && typeof item.search === 'object' ? item.search : {}
          const originFieldProps = item.fieldProps
          const originFormItemProps = item.formItemProps
          const originTransform = (searchProps as any).transform ?? item.transform

          return {
            ...item,
            width: undefined,
            index: item.index ?? index,
            ...searchProps,
            transform: typeof originTransform === 'function'
              ? (value: any, namePath: any, allValues: any) => {
                  if (value === undefined)
                    return undefined
                  return originTransform(value, namePath, allValues)
                }
              : originTransform,
            fieldProps: typeof originFieldProps === 'function'
              ? (form: any, config: any) => originFieldProps(formProxy.value || form, config)
              : originFieldProps,
            formItemProps: typeof originFormItemProps === 'function'
              ? (form: any, config: any) => normalizeFormItemProps(originFormItemProps(formProxy.value || form, config))
              : normalizeFormItemProps(originFormItemProps),
            valueType: finalValueType,
            proFieldProps: {
              ...(competentName.value === 'LightFilter' && item.proFieldProps?.light === undefined
                ? { light: true }
                : {}),
              ...item.proFieldProps,
              proFieldKey: columnKey ? `table-field-${columnKey}` : undefined,
            },
          }
        })
    })

    const loadingProps = computed(() => ({
      submitter: {
        searchConfig: {
          submitText: props.type === 'form' ? undefined : ((props.search as any)?.searchText || props.form?.searchText || '查 询'),
          resetText: props.type === 'form' ? undefined : ((props.search as any)?.resetText || props.form?.resetText || '重 置'),
        },
        submitButtonProps: {
          loading: props.submitButtonLoading,
        },
        onReset: () => {
          props.onReset?.(formProxy.value.getFieldsFormatValue?.(true) ?? formProxy.value.getFieldsValue?.(true) ?? {})
        },
      },
    }))

    function getInitialValues() {
      const values: Record<string, any> = { ...(props.form?.initialValues || {}) }
      columnsList.value.forEach((item: any) => {
        const name = fieldName(item)
        if (name !== undefined && item.initialValue !== undefined)
          setValueByNamePath(values, name, item.initialValue)
      })
      return values
    }

    function updatePendingValues(values: Record<string, any>) {
      pendingValues.value = {
        ...pendingValues.value,
        ...(values || {}),
      }
      proxyRenderTick.value += 1
    }

    function bindForm(instance: any) {
      if (!instance)
        return
      if (instance.formInstance !== undefined)
        layoutFormRef.value = instance
      realFormRef.value = instance
      if (Object.keys(pendingValues.value).length)
        instance.setFieldsValue?.(pendingValues.value)
      setActionRef(props.formRef, formProxy.value)
      if (pendingSubmit.value && instance.submit) {
        pendingSubmit.value = false
        instance.submit()
      }
    }

    const schemaFormRef = {
      get value() {
        return innerFormRef.value
      },
      set value(instance: any) {
        innerFormRef.value = instance
        bindForm(instance)
      },
    }
    setActionRef(props.formRef, formProxy.value)

    return () => {
      const searchConfig = props.search === false ? false : (props.search || {})
      const className = searchPrefixCls.value
      const formClassName = formPrefixCls.value
      const competent = competentName.value

      return (
        <div
          class={[
            cardPrefixCls.value,
            props.bordered ? `${cardPrefixCls.value}-border ${cardPrefixCls.value}-bordered` : '',
            props.ghost ? `${cardPrefixCls.value}-ghost` : '',
            className,
            isForm.value ? formClassName : '',
            `${className}-${toLowerLine(competent)}`,
            props.ghost ? `${className}-ghost` : '',
            searchConfig !== false && (searchConfig as any)?.className ? (searchConfig as any).className : '',
          ]}
        >
          <BetaSchemaForm
            layoutType={competent}
            columns={columnsList.value as any}
            type={props.type}
            {...loadingProps.value}
            {...getFromProps(isForm.value, searchConfig, competent)}
            {...getFormConfigs(isForm.value, props.form || {})}
            formRef={schemaFormRef}
            action={props.action as any}
            dateFormatter={props.dateFormatter}
            onInit={(values: Record<string, any>, form: any) => {
              bindForm(form)
              setActionRef(props.formRef, formProxy.value)
              if (props.type !== 'form') {
                const pageInfo = (props.action as any)?.value?.pageInfo || (props.action as any)?.current?.pageInfo
                const {
                  current = pageInfo?.current,
                  pageSize = pageInfo?.pageSize,
                } = values as any
                ;((props.action as any)?.value || (props.action as any)?.current)?.setPageInfo?.({
                  ...pageInfo,
                  current: Number.parseInt(current, 10),
                  pageSize: Number.parseInt(pageSize, 10),
                })
                if (props.manualRequest)
                  return
                props.onSubmit?.(values, true)
              }
            }}
            onFinish={(values: Record<string, any>) => props.onSubmit?.(values, false)}
            initialValues={props.form?.initialValues}
          />
        </div>
      )
    }
  },
})

export default FormRender
