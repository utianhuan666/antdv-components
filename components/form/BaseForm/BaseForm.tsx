import type { PropType, VNodeChild } from 'vue'
import type { BaseFormProps, SubmitterProps } from '../typing'
import { Form, Row, Spin } from 'antdv-next'
import { computed, defineComponent, nextTick, onMounted, reactive, shallowRef, watch } from 'vue'
import { provideFieldContext } from '../FieldContext'
import { provideGridContext } from '../helpers'
import { provideProFormContext } from '../ProFormContext'
import { provideEditOrReadOnly } from './EditOrReadOnlyContext'
import Submitter from './Submitter'

function readUrlSearch() {
  if (typeof window === 'undefined')
    return {}
  return Array.from(new URLSearchParams(window.location.search).entries()).reduce<Record<string, any>>((result, [key, value]) => {
    result[key] = value
    return result
  }, {})
}

function writeUrlSearch(params: Record<string, any>) {
  if (typeof window === 'undefined')
    return
  const searchParams = new URLSearchParams(window.location.search)
  Object.keys(params).forEach((key) => {
    const value = params[key]
    if (value === undefined || value === null || value === '')
      searchParams.delete(key)
    else
      searchParams.set(key, String(value))
  })
  const search = searchParams.toString()
  const nextUrl = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`
  window.history.replaceState(null, '', nextUrl)
}

function genUrlSyncParams(syncToUrl: BaseFormProps['syncToUrl'], params: Record<string, any>, type: 'get' | 'set') {
  if (syncToUrl === true)
    return params
  return typeof syncToUrl === 'function' ? syncToUrl(params, type) : {}
}

/**
 * BaseForm – 对标 React 版本 `src/form/BaseForm/BaseForm.tsx`：
 * 1. 提供共享 model
 * 2. 提供 FieldContext / GridContext / EditOrReadOnlyContext
 * 3. 处理 onFinish / submitter
 * 4. 支持 contentRender 让 layouts 自定义包装
 */
const BaseForm = defineComponent({
  name: 'BaseProForm',
  props: {
    model: { type: Object as PropType<BaseFormProps['model']>, default: undefined },
    initialValues: { type: Object as PropType<BaseFormProps['initialValues']>, default: () => ({}) },
    layout: { type: String as PropType<BaseFormProps['layout']>, default: 'horizontal' },
    name: { type: String, default: undefined },
    labelCol: { type: Object as PropType<BaseFormProps['labelCol']>, default: undefined },
    wrapperCol: { type: Object as PropType<BaseFormProps['wrapperCol']>, default: undefined },
    grid: { type: Boolean, default: false },
    rowProps: { type: Object as PropType<BaseFormProps['rowProps']>, default: undefined },
    colProps: { type: Object as PropType<BaseFormProps['colProps']>, default: undefined },
    submitter: { type: [Boolean, Object] as PropType<false | SubmitterProps>, default: () => ({}) },
    loading: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: undefined },
    formItemProps: { type: Object as PropType<Record<string, any>>, default: undefined },
    proFieldProps: { type: Object as PropType<Record<string, any>>, default: undefined },
    request: { type: Function as PropType<BaseFormProps['request']>, default: undefined },
    params: { type: Object as PropType<Record<string, any>>, default: undefined },
    syncToUrl: { type: [Boolean, Function] as PropType<BaseFormProps['syncToUrl']>, default: false },
    syncToUrlAsImportant: { type: Boolean, default: false },
    extraUrlParams: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    syncToInitialValues: { type: Boolean, default: true },
    omitNil: { type: Boolean, default: true },
    dateFormatter: {
      type: [String, Boolean, Function] as PropType<BaseFormProps['dateFormatter']>,
      default: 'string',
    },
    isKeyPressSubmit: { type: Boolean, default: false },
    autoFocusFirstInput: { type: Boolean, default: true },
    formKey: { type: String, default: undefined },
    formComponentType: { type: String as PropType<BaseFormProps['formComponentType']>, default: undefined },
    contentRender: {
      type: Function as PropType<NonNullable<BaseFormProps['contentRender']>>,
      default: undefined,
    },
    onFinish: { type: Function as PropType<BaseFormProps['onFinish']>, default: undefined },
    onReset: { type: Function as PropType<BaseFormProps['onReset']>, default: undefined },
    onLoadingChange: { type: Function as PropType<BaseFormProps['onLoadingChange']>, default: undefined },
    onInit: { type: Function as PropType<BaseFormProps['onInit']>, default: undefined },
  },
  emits: ['finish', 'finishFailed', 'valuesChange', 'reset', 'update:loading'],
  setup(props, { attrs, emit, slots, expose }) {
    const formRef = shallowRef<any>()
    const urlParamsMergeInitialValues = props.syncToUrl && props.syncToInitialValues !== false
      ? genUrlSyncParams(props.syncToUrl, readUrlSearch(), 'get')
      : {}

    /** 内部 model：当外部未提供 model 时使用，初始值合并 initialValues */
    const innerModel = reactive<Record<string, any>>(props.syncToUrlAsImportant
      ? { ...(props.initialValues || {}), ...urlParamsMergeInitialValues }
      : { ...urlParamsMergeInitialValues, ...(props.initialValues || {}) })
    const formModel = computed<Record<string, any>>(() => props.model ?? innerModel)

    const innerLoading = shallowRef<boolean>(props.loading)
    const requestLoading = shallowRef<boolean>(false)
    const initialized = shallowRef(false)
    const fieldsValueType = new Map<string, {
      valueType?: unknown
      dateFormat?: string
      transform?: (value: any, namePath: (string | number)[]) => any
    }>()
    watch(() => props.loading, value => (innerLoading.value = value))

    function setLoading(value: boolean) {
      innerLoading.value = value
      emit('update:loading', value)
      props.onLoadingChange?.(value)
    }

    function onUrlSyncReset(finalValues: Record<string, any>) {
      if (!props.syncToUrl)
        return
      const params = Object.keys(finalValues).reduce<Record<string, any>>((result, key) => {
        result[key] = finalValues[key] || undefined
        return result
      }, { ...(props.extraUrlParams || {}) })
      writeUrlSearch(genUrlSyncParams(props.syncToUrl, params, 'set'))
    }

    function onUrlSyncFinish(finalValues: Record<string, any>, allFieldKeys: string[]) {
      if (!props.syncToUrl)
        return
      const params = allFieldKeys.reduce<Record<string, any>>((result, key) => {
        result[key] = finalValues[key] ?? undefined
        return result
      }, { ...(props.extraUrlParams || {}) })
      Object.keys(readUrlSearch()).forEach((key) => {
        if (params[key] !== false && params[key] !== 0 && !params[key])
          params[key] = undefined
      })
      writeUrlSearch(genUrlSyncParams(props.syncToUrl, params, 'set'))
    }

    /** request 初始化 */
    watch(
      () => [props.request, props.params] as const,
      async ([request, params]) => {
        if (!request)
          return
        try {
          requestLoading.value = true
          setLoading(true)
          const data = await request((params || {}) as any)
          if (data) {
            Object.assign(formModel.value, data)
            if (props.syncToUrlAsImportant)
              Object.assign(formModel.value, urlParamsMergeInitialValues)
          }
        }
        finally {
          requestLoading.value = false
          setLoading(false)
        }
      },
      { immediate: true, deep: true },
    )

    function namePathKey(name: (string | number)[]) {
      return JSON.stringify(name)
    }

    function getValueByNamePath(values: Record<string, any>, namePath: (string | number)[]) {
      return namePath.reduce<any>((current, key) => current?.[key], values)
    }

    function setValueByNamePath(values: Record<string, any>, namePath: (string | number)[], value: any) {
      const last = namePath[namePath.length - 1]
      if (last === undefined)
        return values
      const parent = namePath.slice(0, -1).reduce<Record<string, any>>((current, key) => {
        if (!current[key] || typeof current[key] !== 'object')
          current[key] = {}
        return current[key]
      }, values)
      parent[last] = value
      return values
    }

    function deleteValueByNamePath(values: Record<string, any>, namePath: (string | number)[]) {
      const last = namePath[namePath.length - 1]
      if (last === undefined)
        return
      const parent = namePath.slice(0, -1).reduce<any>((current, key) => current?.[key], values)
      if (parent && typeof parent === 'object')
        delete parent[last]
    }

    function cloneValue<T>(value: T): T {
      if (Array.isArray(value))
        return value.map(item => cloneValue(item)) as T
      if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
        return Object.keys(value).reduce<Record<string, any>>((result, key) => {
          result[key] = cloneValue((value as Record<string, any>)[key])
          return result
        }, {}) as T
      }
      return value
    }

    function isNilValue(value: any) {
      return value === null || value === undefined || value === ''
    }

    function omitNilValues(value: any): any {
      if (Array.isArray(value))
        return value.map(item => omitNilValues(item)).filter(item => !isNilValue(item))
      if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
        return Object.keys(value).reduce<Record<string, any>>((result, key) => {
          const nextValue = omitNilValues(value[key])
          if (!isNilValue(nextValue))
            result[key] = nextValue
          return result
        }, {})
      }
      return value
    }

    function isDateValueType(valueType: unknown) {
      return typeof valueType === 'string' && /date|time/i.test(valueType)
    }

    function formatDateValue(value: any, valueType?: unknown, dateFormat?: string): any {
      if (!isDateValueType(valueType) || props.dateFormatter === false || value == null)
        return value

      if (Array.isArray(value))
        return value.map(item => formatDateValue(item, valueType, dateFormat))

      if (!value || typeof value !== 'object')
        return value

      if (typeof props.dateFormatter === 'function')
        return props.dateFormatter(value, String(valueType))

      if (props.dateFormatter === 'number')
        return typeof value.valueOf === 'function' ? value.valueOf() : value

      const format = dateFormat || (props.dateFormatter === 'string' ? 'YYYY-MM-DD' : props.dateFormatter)
      return typeof value.format === 'function' ? value.format(format) : value
    }

    function transformKey(values: Record<string, any>, omitNilParam = props.omitNil, parentKey: (string | number)[] = []) {
      const result = cloneValue(values || {})
      fieldsValueType.forEach((config, key) => {
        const namePath = [...parentKey, ...(JSON.parse(key) as (string | number)[])]
        const value = getValueByNamePath(values, namePath)
        const formattedValue = formatDateValue(value, config.valueType, config.dateFormat)
        const transformed = config.transform
          ? config.transform(formattedValue, namePath)
          : formattedValue
        deleteValueByNamePath(result, namePath)
        if (transformed && typeof transformed === 'object' && !Array.isArray(transformed))
          Object.assign(result, transformed)
        else
          setValueByNamePath(result, namePath, transformed)
      })
      return omitNilParam ? omitNilValues(result) : result
    }

    function getFieldsFormatValue(_allData?: true, omitNilParam?: boolean) {
      return transformKey(getFieldsValue(), omitNilParam ?? props.omitNil)
    }

    function getFieldFormatValue(name: string | number | (string | number)[], omitNilParam?: boolean) {
      const namePath = Array.isArray(name) ? name : [name]
      const value = getFieldValue(namePath)
      const transformed = transformKey(setValueByNamePath({}, namePath, value) as any, omitNilParam ?? props.omitNil)
      const result = getValueByNamePath(transformed, namePath)
      if (result && typeof result === 'object' && !Array.isArray(result))
        return Object.values(result)[0]
      return result
    }

    function getFieldFormatValueObject(name: string | number | (string | number)[], omitNilParam?: boolean) {
      const namePath = Array.isArray(name) ? name : [name]
      const value = getFieldValue(namePath)
      return transformKey(setValueByNamePath({}, namePath, value) as any, omitNilParam ?? props.omitNil)
    }

    async function handleFinish() {
      const finalValues = getFieldsFormatValue()
      emit('finish', finalValues)
      if (!props.onFinish || innerLoading.value)
        return
      try {
        setLoading(true)
        const response = await props.onFinish(finalValues as any)
        if (response) {
          const allFieldKeys = Object.keys(getFieldsFormatValue(true, false))
          onUrlSyncFinish(finalValues, allFieldKeys)
        }
      }
      finally {
        setLoading(false)
      }
    }

    function handleFinishFailed(errorInfo: unknown) {
      emit('finishFailed', errorInfo)
    }

    function handleValuesChange(changedValues: Record<string, any>, allValues: Record<string, any>) {
      emit('valuesChange', transformKey(changedValues), transformKey(allValues))
    }

    function handleKeydown(event: KeyboardEvent) {
      if (!props.isKeyPressSubmit || event.key !== 'Enter')
        return
      submit()
    }

    function submit() {
      formRef.value?.submit?.()
    }

    function getFieldsValue() {
      return { ...formModel.value }
    }

    function getFieldValue(name: string | number | (string | number)[]) {
      const namePath = Array.isArray(name) ? name : [name]
      return getValueByNamePath(formModel.value, namePath)
    }

    function setFieldsValue(values: Record<string, any>) {
      Object.assign(formModel.value, values)
      formRef.value?.setFieldsValue?.(values)
    }

    async function validateFieldsReturnFormatValue(nameList?: (string | number | (string | number)[])[], omitNilParam?: boolean) {
      await formRef.value?.validateFields?.(nameList as any)
      return getFieldsFormatValue(true, omitNilParam)
    }

    function reset() {
      Object.keys(formModel.value).forEach((key) => {
        delete formModel.value[key]
      })
      Object.assign(formModel.value, props.initialValues || {})
      formRef.value?.resetFields?.()
      emit('reset')
    }

    /** 暴露 ProFormInstance 子集 */
    expose({
      get formInstance() {
        return formRef.value
      },
      submit,
      reset,
      getFieldsValue,
      getFieldValue,
      getFieldsFormatValue,
      getFieldFormatValue,
      getFieldFormatValueObject,
      validateFieldsReturnFormatValue,
      setFieldsValue,
    })

    function triggerInit() {
      if (initialized.value || requestLoading.value)
        return
      initialized.value = true
      nextTick(() => {
        props.onInit?.(getFieldsFormatValue() as any, {
          ...formRef.value,
          getFieldsValue,
          getFieldValue,
          getFieldsFormatValue,
          getFieldFormatValue,
          getFieldFormatValueObject,
          validateFieldsReturnFormatValue,
          setFieldsValue,
        })
      })
    }

    onMounted(triggerInit)
    watch(requestLoading, triggerInit)

    /** 注入上下文（保持响应式，使 readonly 切换可以下发到所有子字段） */
    provideEditOrReadOnly({
      get readonly() {
        return props.readonly
      },
    })
    provideGridContext({
      grid: Boolean(props.grid),
      rowProps: props.rowProps,
      colProps: props.colProps,
    })
    provideProFormContext({
      formRef,
      getFieldsFormatValue,
      getFieldFormatValue,
      getFieldFormatValueObject,
      validateFieldsReturnFormatValue,
    })
    provideFieldContext({
      get formInstance() {
        return formRef.value
      },
      get model() {
        return formModel.value
      },
      fieldProps: props.fieldProps,
      formItemProps: props.formItemProps,
      proFieldProps: { readonly: props.readonly, ...(props.proFieldProps || {}) },
      grid: Boolean(props.grid),
      colProps: props.colProps,
      rowProps: props.rowProps,
      formKey: props.formKey || props.name,
      get loading() {
        return innerLoading.value
      },
      setFieldValueType: (
        name: (string | number)[],
        config: {
          valueType?: unknown
          dateFormat?: string
          transform?: (value: any, namePath: (string | number)[]) => any
        },
      ) => {
        fieldsValueType.set(namePathKey(name), config)
      },
      clearFieldValueType: (name: (string | number)[]) => {
        fieldsValueType.delete(namePathKey(name))
      },
    } as any)

    function renderSubmitter(): VNodeChild | undefined {
      if (props.submitter === false)
        return undefined
      const submitterProps = (typeof props.submitter === 'boolean' || !props.submitter ? {} : props.submitter) as SubmitterProps
      return (
        <Submitter
          context={{ form: formRef.value, submit, reset }}
          searchConfig={submitterProps.searchConfig}
          submitButtonProps={submitterProps.submitButtonProps === false
            ? false
            : {
                loading: innerLoading.value,
                ...(typeof submitterProps.submitButtonProps === 'object' ? submitterProps.submitButtonProps : {}),
              }}
          resetButtonProps={submitterProps.resetButtonProps}
          render={slots.submitter
            ? (submitterContext, doms) => slots.submitter?.({ props: submitterContext, doms })
            : submitterProps.render}
          onSubmit={() => {
            submitterProps.onSubmit?.(getFieldsFormatValue())
          }}
          onReset={() => {
            const finalValues = getFieldsFormatValue()
            submitterProps.onReset?.(finalValues)
            props.onReset?.(finalValues as any)
            onUrlSyncReset(finalValues)
          }}
        />
      )
    }

    function renderBaseFormComponents() {
      const items = slots.default?.() as VNodeChild
      const wrapItems = props.grid
        ? <Row gutter={8} {...(props.rowProps || {})}>{items}</Row>
        : items
      const submitterNode = renderSubmitter()
      const content = props.contentRender
        ? props.contentRender(wrapItems, submitterNode, formRef.value)
        : wrapItems
      return content
    }

    return () => {
      if (props.request && requestLoading.value) {
        return (
          <div style={{ paddingTop: '50px', paddingBottom: '50px', textAlign: 'center' }}>
            <Spin />
          </div>
        )
      }

      const content = renderBaseFormComponents()
      const keyPressSubmitProps = props.isKeyPressSubmit ? { onKeydown: handleKeydown } : {}

      return (
        <Form
          ref={formRef}
          model={formModel.value}
          layout={props.layout as any}
          name={props.name}
          labelCol={props.labelCol as any}
          wrapperCol={props.wrapperCol as any}
          {...attrs}
          onFinish={handleFinish as any}
          onFinishFailed={handleFinishFailed as any}
          onValuesChange={handleValuesChange as any}
          {...keyPressSubmitProps as any}
        >
          {content}
        </Form>
      )
    }
  },
})

export default BaseForm
export { BaseForm }
