import type { StepsProps } from 'antdv-next'
import type { CSSProperties, FunctionalComponent, VNode, VNodeChild } from 'vue'
import type { FormData, FormRefLike, ProFormProps, SubmitterProps, ValueRef } from '../../typing'
import type { StepFormProps } from './StepForm'
import { Button, Col, Row, Space, Steps } from 'antdv-next'
import { cloneVNode, computed, defineComponent, Fragment, h, inject, isVNode, nextTick, provide, ref, shallowRef } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import StepForm from './StepForm'

export interface StepsFormContextValue {
  readonly current: number
  readonly stepCount: number
  readonly loading: boolean
  setCurrent: (index: number) => void
  next: () => void
}

const StepsFormContextKey = Symbol('StepsFormContext')

export function useStepsFormContext() {
  const context = inject<StepsFormContextValue | undefined>(StepsFormContextKey, undefined)
  if (!context)
    throw new Error('useStepsFormContext must be used within StepsForm')
  return context
}

export interface StepsFormRef {
  getAllFieldsValue: () => FormData
  getAllFieldsFormatValue: (omitNil?: boolean) => FormData
  getCurrentStep: () => number
  setCurrentStep: (stepIndex: number) => void
  getStepFormInstance: (stepIndex: number) => FormRefLike | undefined
  resetSteps: () => void
}

export interface StepsFormProps<T extends FormData = FormData> {
  onFinish?: (values: T) => Promise<boolean | void> | boolean | void
  current?: number
  stepsProps?: StepsProps
  formProps?: ProFormProps<T>
  onCurrentChange?: (current: number) => void
  stepsRender?: (
    steps: { key: string, title?: VNodeChild }[],
    defaultDom: VNodeChild,
  ) => VNodeChild
  formRef?: ValueRef<FormRefLike | null>
  stepsFormRef?: ValueRef<StepsFormRef | null>
  formMapRef?: ValueRef<Array<FormRefLike | undefined>>
  allowStepSelect?: boolean
  stepFormRender?: (form: VNodeChild) => VNodeChild
  stepsFormRender?: (form: VNodeChild, submitter: VNodeChild) => VNodeChild
  submitter?: (SubmitterProps & {
    onSubmit?: () => void
    onReset?: () => void
  }) | false
  containerStyle?: CSSProperties
  layoutRender?: (layoutDom: { stepsDom: VNodeChild, formDom: VNodeChild }) => VNodeChild
}

const stepsFormPropNames = [
  'onFinish',
  'current',
  'stepsProps',
  'formProps',
  'onCurrentChange',
  'stepsRender',
  'formRef',
  'stepsFormRef',
  'formMapRef',
  'allowStepSelect',
  'stepFormRender',
  'stepsFormRender',
  'submitter',
  'containerStyle',
  'layoutRender',
] as const

function resolveBoolean(value: unknown, fallback = false) {
  if (value === undefined)
    return fallback
  return value === '' || value === true
}

function flattenChildren(children: VNodeChild): VNode[] {
  const list = Array.isArray(children) ? children : [children]
  return list.flatMap((item): VNode[] => {
    if (!isVNode(item))
      return []
    if (item.type === Fragment)
      return flattenChildren(item.children as VNodeChild)
    return [item]
  })
}

function mergeValues(parts: FormData[]) {
  return parts.reduce<FormData>((result, item) => ({ ...result, ...(item || {}) }), {})
}

const StepsFormInner = defineComponent({
  name: 'StepsForm',
  inheritAttrs: false,
  props: [...stepsFormPropNames],
  emits: ['currentChange'],
  setup(rawProps, { attrs, slots, emit, expose }) {
    const props = rawProps as Readonly<StepsFormProps>
    const prefixCls = useProPrefixCls('pro-steps-form')
    const innerCurrent = ref(0)
    const formValues = shallowRef(new Map<string, FormData>())
    const formInstances = shallowRef<Array<FormRefLike | undefined>>([])
    const loading = ref(false)

    const current = computed(() => props.current ?? innerCurrent.value)
    const stepItems = computed(() => flattenChildren(slots.default?.() || []))
    const onFinish = (values: FormData) => {
      const handler = props.onFinish ?? (attrs.onFinish as StepsFormProps['onFinish'] | undefined)
      return handler?.(values)
    }

    function setCurrent(nextCurrent: number) {
      if (nextCurrent < 0 || nextCurrent >= stepItems.value.length)
        return
      if (props.current === undefined)
        innerCurrent.value = nextCurrent
      props.onCurrentChange?.(nextCurrent)
      emit('currentChange', nextCurrent)
      nextTick(() => {
        if (props.formRef)
          props.formRef.value = formInstances.value[nextCurrent]
      })
    }

    provide(StepsFormContextKey, {
      get current() {
        return current.value
      },
      get stepCount() {
        return stepItems.value.length
      },
      get loading() {
        return loading.value
      },
      setCurrent,
      next: () => setCurrent(current.value + 1),
    })

    function getAllFieldsValue() {
      const values = formInstances.value.map(form => form?.getFieldsValue?.() || {})
      return mergeValues(values)
    }

    function getAllFieldsFormatValue(omitNil?: boolean) {
      const values = formInstances.value.map(form => form?.getFieldsFormatValue?.(true, omitNil) || {})
      return mergeValues(values)
    }

    function resetSteps() {
      formValues.value.clear()
      formInstances.value.forEach(form => form?.reset?.())
      setCurrent(0)
    }

    const stepsRef = computed<StepsFormRef>(() => ({
      getAllFieldsValue,
      getAllFieldsFormatValue,
      getCurrentStep: () => current.value,
      setCurrentStep: setCurrent,
      getStepFormInstance: (stepIndex: number) => formInstances.value[stepIndex],
      resetSteps,
    }))

    expose(stepsRef.value)
    if (props.stepsFormRef)
      props.stepsFormRef.value = stepsRef.value

    function onFormReady(step: number, form: FormRefLike) {
      formInstances.value[step] = form
      if (props.formMapRef)
        props.formMapRef.value = formInstances.value
      if (step === current.value && props.formRef)
        props.formRef.value = form
    }

    async function onStepFinish(name: string, values: FormData) {
      const currentFormValues = formInstances.value[current.value]?.getFieldsFormatValue?.() || values
      const nextValues = new Map(formValues.value)
      nextValues.set(name, currentFormValues)
      formValues.value = nextValues

      const isLastStep = current.value === stepItems.value.length - 1
      if (!isLastStep) {
        setCurrent(current.value + 1)
        return
      }

      loading.value = true
      try {
        const merged = mergeValues(Array.from(nextValues.values()))
        const result = await onFinish(merged)
        if (result)
          resetSteps()
      }
      finally {
        loading.value = false
      }
    }

    function submitCurrent() {
      const submitter = props.submitter === false ? undefined : props.submitter
      submitter?.onSubmit?.()
      formInstances.value[current.value]?.submit?.()
    }

    function prePage() {
      if (current.value < 1)
        return
      setCurrent(current.value - 1)
      const submitter = props.submitter === false ? undefined : props.submitter
      submitter?.onReset?.()
    }

    function renderStepsDom() {
      const items = stepItems.value.map((item, index) => {
        const itemProps = item.props || {}
        return {
          key: String(itemProps.name ?? index),
          title: itemProps.title,
          ...(itemProps.stepProps || {}),
        }
      })

      const dom = (
        <div
          class={`${prefixCls.value}-steps-container`}
          style={{ maxWidth: `${Math.min(items.length * 320, 1160)}px` }}
        >
          <Steps
            {...(props.stepsProps || {})}
            items={items}
            current={current.value}
            onChange={(nextStep: number) => {
              if (resolveBoolean(props.allowStepSelect))
                setCurrent(nextStep)
              props.stepsProps?.onChange?.(nextStep)
            }}
          />
        </div>
      )

      if (props.stepsRender) {
        return props.stepsRender(
          items.map(item => ({ key: item.key, title: item.title })),
          dom,
        )
      }
      return dom
    }

    function renderSubmitter() {
      if (props.submitter === false)
        return null

      const submitter = (props.submitter || {}) as SubmitterProps
      const submitText = submitter.searchConfig?.submitText ?? '提交'
      const nextText = submitter.searchConfig?.submitText ?? '下一步'
      const preText = submitter.searchConfig?.resetText ?? '上一步'
      const isLastStep = current.value === stepItems.value.length - 1

      const buttons = [
        current.value > 0
          ? (
              <Button key="pre" {...(submitter.resetButtonProps || {})} onClick={prePage}>
                {preText}
              </Button>
            )
          : null,
        <Button
          key="submit"
          type="primary"
          loading={loading.value}
          {...(submitter.submitButtonProps || {})}
          onClick={submitCurrent}
        >
          {isLastStep ? submitText : nextText}
        </Button>,
      ].filter(Boolean) as VNodeChild[]

      if (submitter.render)
        return submitter.render({ form: formInstances.value[current.value], submit: submitCurrent, reset: prePage }, buttons)
      if (submitter.render === false)
        return null
      return buttons
    }

    function renderForms() {
      return stepItems.value.map((item, index) => {
        const itemProps = item.props || {}
        const name = String(itemProps.name ?? index)
        const active = index === current.value
        const form = cloneVNode(item, {
          ...props.formProps,
          ...itemProps,
          name,
          step: index,
          active,
          onStepFinish,
          onFormReady,
        })

        return (
          <div
            key={name}
            class={[
              `${prefixCls.value}-step`,
              active ? `${prefixCls.value}-step-active` : '',
            ]}
            style={{ display: active ? undefined : 'none' }}
          >
            {props.stepFormRender && active ? props.stepFormRender(form) : form}
          </div>
        )
      })
    }

    function renderLayout(stepsDom: VNodeChild, formDom: VNodeChild) {
      if (props.layoutRender)
        return props.layoutRender({ stepsDom, formDom })

      if (props.stepsProps?.orientation === 'vertical') {
        return (
          <Row align="stretch" wrap gutter={{ xs: 8, sm: 16, md: 24 }}>
            <Col xxl={4} xl={6} lg={7} md={8} sm={10} xs={12}>{stepsDom}</Col>
            <Col>{formDom}</Col>
          </Row>
        )
      }

      return (
        <>
          <Row gutter={{ xs: 8, sm: 16, md: 24 }}>
            <Col span={24}>{stepsDom}</Col>
          </Row>
          <Row gutter={{ xs: 8, sm: 16, md: 24 }}>
            <Col span={24}>{formDom}</Col>
          </Row>
        </>
      )
    }

    return () => {
      const submitterDom = renderSubmitter()
      const formContainer = (
        <div class={`${prefixCls.value}-container`} style={props.containerStyle}>
          {renderForms()}
          {props.stepsFormRender ? null : <Space>{submitterDom}</Space>}
        </div>
      )
      const layoutDom = renderLayout(renderStepsDom(), formContainer)
      const content = props.stepsFormRender ? props.stepsFormRender(layoutDom, submitterDom) : layoutDom

      return h('div', { class: prefixCls.value }, content ?? undefined)
    }
  },
})

const StepsForm = StepsFormInner as unknown as FunctionalComponent<StepsFormProps> & {
  StepForm: typeof StepForm
}

StepsForm.StepForm = StepForm

export default StepsForm
export { StepForm, StepsForm }
export type { StepFormProps }
