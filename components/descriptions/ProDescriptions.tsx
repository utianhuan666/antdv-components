import type { DescriptionsItemType } from 'antdv-next'
import type { ProDescriptionsActionType, ProDescriptionsProps } from './typing'
import type { ProDescriptionsRequestResult } from './useFetchData'
import { Descriptions, Space } from 'antdv-next'
import { computed, defineComponent, reactive, ref, shallowRef, watch, watchEffect } from 'vue'
import { ProForm } from '../form'
import { ProConfigProvider } from '../provider'
import { useProPrefixCls } from '../provider/useProPrefixCls'
import ProSkeleton from '../skeleton'
import { ErrorBoundary, getValueByNamePath, LabelIconTip, stableStringify, useEditableMap } from '../utils'
import { schemaToDescriptionsItem } from './schemaToDescriptionsItem'
import useFetchData, { setActionRef } from './useFetchData'

function clonePlain<T>(value: T): T {
  if (Array.isArray(value))
    return value.map(item => clonePlain(item)) as T
  if (value && typeof value === 'object') {
    return Object.keys(value as Record<string, any>).reduce<Record<string, any>>((result, key) => {
      result[key] = clonePlain((value as Record<string, any>)[key])
      return result
    }, {}) as T
  }
  return value
}

const proDescriptionsPropNames = [
  'request',
  'columns',
  'params',
  'dataSource',
  'onDataSourceChange',
  'formProps',
  'editable',
  'loading',
  'onLoadingChange',
  'actionRef',
  'onRequestError',
  'emptyText',
  'tooltip',
  'title',
  'extra',
]

const ProDescriptionsImpl = defineComponent({
  name: 'ProDescriptions',
  inheritAttrs: false,
  props: proDescriptionsPropNames,
  setup(rawProps, { attrs }) {
    const props = rawProps as ProDescriptionsProps<Record<string, any>, any>
    const prefixCls = useProPrefixCls('pro-descriptions')
    const formRef = shallowRef<any>()
    const formKey = ref(0)

    const action = useFetchData<
      Record<string, any>,
      ProDescriptionsRequestResult<Record<string, any>>
    >(
      async () => {
        const data = props.request
          ? await props.request(props.params)
          : { data: {} as Record<string, any> }
        return data
      },
      {
        onRequestError: props.onRequestError,
        effectKey: computed(() => stableStringify(props.params)),
        manual: !props.request,
        get dataSource() {
          return props.dataSource
        },
        get loading() {
          return props.loading
        },
        onLoadingChange: props.onLoadingChange,
        onDataSourceChange: props.onDataSourceChange,
      } as any,
    )

    const editableDataSource = computed(() => (action.dataSource || {}) as Record<string, any>)
    const editableInitialValues = shallowRef<Record<string, any>>({})
    watch(
      () => action.dataSource,
      (value) => {
        editableInitialValues.value = clonePlain((value || {}) as Record<string, any>)
      },
      { immediate: true },
    )
    const columnsByKey = computed(() => new Map(
      (props.columns || []).map((column, index) => [JSON.stringify([(column.dataIndex as any) ?? index].flat(1)), column]),
    ))

    function getEditableColumn(recordKey: any) {
      return columnsByKey.value.get(JSON.stringify([recordKey].flat(1)))
    }

    const editableForm = computed(() => {
      if (props.editable?.form)
        return props.editable.form

      const getInnerForm = () => formRef.value?.formInstance

      return {
        get formInstance() {
          return getInnerForm()
        },
        getFieldValue: (name: any) => formRef.value?.getFieldValue?.(name),
        getFieldsValue: (...args: any[]) => formRef.value?.getFieldsValue?.(...args),
        setFieldsValue: (...args: any[]) => formRef.value?.setFieldsValue?.(...args),
        resetFields: (...args: any[]) => {
          const resetValues = clonePlain(editableInitialValues.value)
          action.setDataSource(resetValues)
          formRef.value?.setFieldsValue?.(resetValues)
          formKey.value += 1
          if (formRef.value?.reset)
            return formRef.value.reset(...args)
          const innerForm = getInnerForm()
          if (innerForm?.resetFields)
            return innerForm.resetFields(...args)
          return undefined
        },
        validateFields: (...args: any[]) => {
          const innerForm = getInnerForm()
          if (innerForm?.validateFields)
            return innerForm.validateFields(...args)
          return formRef.value?.validateFieldsReturnFormatValue?.(args[0])
        },
      }
    })

    async function validateEditable(recordKey: any) {
      const form = editableForm.value
      if (form?.validateFields) {
        await form.validateFields([recordKey].flat(1))
        return
      }
      const column = getEditableColumn(recordKey)
      const formItemProps = typeof column?.formItemProps === 'function'
        ? column.formItemProps(undefined as any, { rowKey: recordKey })
        : column?.formItemProps
      const rules = formItemProps?.rules || []
      const value = getValueByNamePath(editableDataSource.value, recordKey)
      const empty = value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)
      const invalid = rules.some((rule: any) => rule?.required && empty)
      if (invalid)
        throw new Error('Validation failed')
    }

    const editableUtils = useEditableMap<Record<string, any>>({
      childrenColumnName: undefined,
      get editableKeys() {
        return props.editable?.editableKeys
      },
      get type() {
        return props.editable?.type
      },
      get actionRender() {
        return props.editable?.actionRender
      },
      onCancel: (...args: any[]) => (props.editable?.onCancel as any)?.(...args),
      onSave: (...args: any[]) => (props.editable?.onSave as any)?.(...args),
      onValuesChange: (...args: any[]) => (props.editable?.onValuesChange as any)?.(...args),
      onChange: (...args: any[]) => (props.editable?.onChange as any)?.(...args),
      get dataSource() {
        return editableDataSource.value
      },
      setDataSource: (dataSource: Record<string, any> | ((data: Record<string, any>) => Record<string, any>)) => {
        const next = typeof dataSource === 'function' ? dataSource(editableDataSource.value) : dataSource
        action.setDataSource(next)
      },
      validateEditable,
    } as any)

    const coreAction = computed<ProDescriptionsActionType<Record<string, any>>>(() => {
      const base = {
        reload: action.reload,
        dataSource: action.dataSource,
        setDataSource: action.setDataSource,
      } as ProDescriptionsActionType<Record<string, any>>
      if (props.editable)
        return { ...base, ...editableUtils }
      return base
    })

    watchEffect(() => {
      setActionRef(props.actionRef, coreAction.value)
    })

    const schemaContent = computed(() => {
      const resolvedColumns = (props.columns || [])
        .filter((item) => {
          if (!item)
            return false
          if (
            item?.valueType
            && ['index', 'indexBorder'].includes(item?.valueType as string)
          ) {
            return false
          }
          return !item?.hideInDescriptions
        })
        .sort((a, b) => {
          const orderA = a.order
          const orderB = b.order
          if (orderA != null || orderB != null)
            return (orderB ?? 0) - (orderA ?? 0)
          return (b.index || 0) - (a.index || 0)
        })

      return schemaToDescriptionsItem(
        resolvedColumns,
        action.dataSource,
        coreAction.value,
        props.editable ? editableUtils : undefined,
        props.emptyText,
        editableForm.value,
      )
    })

    return () => {
      if (action.loading || (action.loading === undefined && props.request)) {
        return <ProSkeleton type="descriptions" list={false} pageHeader={false} />
      }

      const { options, children } = schemaContent.value
      const title = props.title || props.tooltip
        ? <LabelIconTip label={props.title as any} tooltip={props.tooltip} />
        : undefined
      const descriptions = (
        <Descriptions
          class={prefixCls.value}
          {...attrs}
          styles={{
            content: {
              minWidth: 0,
            },
          } as any}
          extra={options || props.extra
            ? (
                <Space>
                  {options}
                  {props.extra}
                </Space>
              )
            : undefined}
          title={title}
          items={children as DescriptionsItemType[]}
        />
      )

      const body = props.editable
        ? (
            <ProForm
              ref={formRef}
              key={`form-${formKey.value}`}
              form={props.editable?.form}
              model={action.dataSource || reactive({})}
              component={false}
              submitter={false}
              initialValues={clonePlain(action.dataSource || {})}
              {...props.formProps as any}
              onFinish={undefined}
            >
              {descriptions}
            </ProForm>
          )
        : descriptions

      return (
        <ErrorBoundary>
          <ProConfigProvider>
            {body}
          </ProConfigProvider>
        </ErrorBoundary>
      )
    }
  },
})

const ProDescriptions = ProDescriptionsImpl as typeof ProDescriptionsImpl & {
  new(): { $props: ProDescriptionsProps<any, any> }
}

export { ProDescriptions }
export default ProDescriptions
