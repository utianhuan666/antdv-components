import type { PropType, VNodeChild } from 'vue'
import type { BaseFormProps, SubmitterProps } from '../typing'
import { Form } from 'antdv-next'
import { computed, defineComponent, reactive, ref, shallowRef, watch } from 'vue'
import { provideFieldContext } from '../FieldContext'
import { provideGridContext } from '../helpers'
import { provideEditOrReadOnly } from './EditOrReadOnlyContext'
import Submitter from './Submitter'

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
    contentRender: {
      type: Function as PropType<NonNullable<BaseFormProps['contentRender']>>,
      default: undefined,
    },
    onFinish: { type: Function as PropType<BaseFormProps['onFinish']>, default: undefined },
    onLoadingChange: { type: Function as PropType<BaseFormProps['onLoadingChange']>, default: undefined },
    onInit: { type: Function as PropType<BaseFormProps['onInit']>, default: undefined },
  },
  emits: ['finish', 'finishFailed', 'valuesChange', 'reset', 'update:loading'],
  setup(props, { attrs, emit, slots, expose }) {
    const formRef = shallowRef<any>()

    /** 内部 model：当外部未提供 model 时使用，初始值合并 initialValues */
    const innerModel = reactive<Record<string, any>>({ ...(props.initialValues || {}) })
    const formModel = computed<Record<string, any>>(() => props.model ?? innerModel)

    const innerLoading = ref<boolean>(props.loading)
    watch(() => props.loading, value => (innerLoading.value = value))

    function setLoading(value: boolean) {
      innerLoading.value = value
      emit('update:loading', value)
      props.onLoadingChange?.(value)
    }

    /** request 初始化 */
    watch(
      () => [props.request, props.params] as const,
      async ([request, params]) => {
        if (!request)
          return
        try {
          setLoading(true)
          const data = await request((params || {}) as any)
          if (data)
            Object.assign(formModel.value, data)
        }
        finally {
          setLoading(false)
        }
      },
      { immediate: true, deep: true },
    )

    function handleFinish(values: Record<string, any>) {
      emit('finish', values)
      const result = props.onFinish?.(values as any)
      if (result && typeof (result as Promise<any>).then === 'function') {
        setLoading(true)
        ;(result as Promise<any>).finally(() => setLoading(false))
      }
    }

    function handleFinishFailed(errorInfo: unknown) {
      emit('finishFailed', errorInfo)
    }

    function handleValuesChange(changedValues: Record<string, any>, allValues: Record<string, any>) {
      emit('valuesChange', changedValues, allValues)
    }

    function submit() {
      formRef.value?.submit?.()
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
      getFieldsValue: () => ({ ...formModel.value }),
      setFieldsValue: (values: Record<string, any>) => Object.assign(formModel.value, values),
    })

    /** 注入上下文 */
    provideEditOrReadOnly({ readonly: props.readonly })
    provideGridContext({
      grid: Boolean(props.grid),
      rowProps: props.rowProps,
      colProps: props.colProps,
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
      formKey: props.name,
      get loading() {
        return innerLoading.value
      },
    } as any)

    function renderSubmitter(): VNodeChild | undefined {
      if (props.submitter === false)
        return undefined
      const submitter = (props.submitter || {}) as SubmitterProps
      return (
        <Submitter
          context={{ form: formRef.value, submit, reset }}
          searchConfig={submitter.searchConfig}
          submitButtonProps={submitter.submitButtonProps}
          resetButtonProps={submitter.resetButtonProps}
          render={submitter.render}
          onSubmit={() => {
            submitter.onSubmit?.()
            submit()
          }}
          onReset={() => {
            submitter.onReset?.()
            reset()
          }}
        />
      )
    }

    return () => {
      const items = slots.default?.() as VNodeChild
      const submitterNode = renderSubmitter()
      const content = props.contentRender
        ? props.contentRender(items, submitterNode, formRef.value)
        : (
            <>
              {items}
              {submitterNode}
            </>
          )

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
        >
          {content}
        </Form>
      )
    }
  },
})

export default BaseForm
export { BaseForm }
