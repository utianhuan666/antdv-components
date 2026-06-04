import type { PropType, VNode, VNodeChild } from 'vue'
import type { SubmitterProps } from '../../typing'
import type { StepFormProps } from './StepForm'
import { Button, Col, Row, Space, Steps } from 'antdv-next'
import { cloneVNode, computed, defineComponent, Fragment, h, inject, isVNode, nextTick, provide, ref, shallowRef } from 'vue'
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
  getAllFieldsValue: () => Record<string, any>
  getAllFieldsFormatValue: (omitNil?: boolean) => Record<string, any>
  getCurrentStep: () => number
  setCurrentStep: (stepIndex: number) => void
  getStepFormInstance: (stepIndex: number) => any
  resetSteps: () => void
}

export interface StepsFormProps<T = Record<string, any>> {
  onFinish?: (values: T) => Promise<boolean | void> | boolean | void
  current?: number
  stepsProps?: Record<string, any>
  formProps?: Record<string, any>
  onCurrentChange?: (current: number) => void
  stepsRender?: (
    steps: { key: string, title?: VNodeChild }[],
    defaultDom: VNodeChild,
  ) => VNodeChild
  formRef?: { value?: any }
  stepsFormRef?: { value?: StepsFormRef | null }
  formMapRef?: { value?: any[] }
  allowStepSelect?: boolean
  stepFormRender?: (form: VNodeChild) => VNodeChild
  stepsFormRender?: (form: VNodeChild, submitter: VNodeChild) => VNodeChild
  submitter?: (SubmitterProps & {
    onSubmit?: () => void
    onReset?: () => void
  }) | false
  containerStyle?: Record<string, any>
  layoutRender?: (layoutDom: { stepsDom: VNodeChild, formDom: VNodeChild }) => VNodeChild
}

function flattenChildren(children: VNodeChild): VNode[] {
  const list = Array.isArray(children) ? children : [children]
  return list.flatMap((item: any): VNode[] => {
    if (!isVNode(item))
      return []
    if (item.type === Fragment)
      return flattenChildren(item.children as any)
    return [item]
  })
}

function mergeValues(parts: Record<string, any>[]) {
  return parts.reduce<Record<string, any>>((result, item) => ({ ...result, ...(item || {}) }), {})
}

const StepsFormInner = defineComponent({
  name: 'StepsForm',
  inheritAttrs: false,
  props: {
    onFinish: { type: Function as PropType<StepsFormProps['onFinish']>, default: undefined },
    current: { type: Number, default: undefined },
    stepsProps: { type: Object as PropType<Record<string, any>>, default: undefined },
    formProps: { type: Object as PropType<Record<string, any>>, default: undefined },
    onCurrentChange: { type: Function as PropType<(current: number) => void>, default: undefined },
    stepsRender: { type: Function as PropType<StepsFormProps['stepsRender']>, default: undefined },
    formRef: { type: Object as PropType<StepsFormProps['formRef']>, default: undefined },
    stepsFormRef: { type: Object as PropType<StepsFormProps['stepsFormRef']>, default: undefined },
    formMapRef: { type: Object as PropType<StepsFormProps['formMapRef']>, default: undefined },
    allowStepSelect: { type: Boolean, default: false },
    stepFormRender: { type: Function as PropType<StepsFormProps['stepFormRender']>, default: undefined },
    stepsFormRender: { type: Function as PropType<StepsFormProps['stepsFormRender']>, default: undefined },
    submitter: { type: [Boolean, Object] as PropType<StepsFormProps['submitter']>, default: () => ({}) },
    containerStyle: { type: Object as PropType<Record<string, any>>, default: undefined },
    layoutRender: { type: Function as PropType<StepsFormProps['layoutRender']>, default: undefined },
  },
  emits: ['currentChange'],
  setup(props, { slots, emit, expose }) {
    const innerCurrent = ref(0)
    const formValues = shallowRef(new Map<string, Record<string, any>>())
    const formInstances = shallowRef<any[]>([])
    const loading = ref(false)

    const current = computed(() => props.current ?? innerCurrent.value)
    const stepItems = computed(() => flattenChildren(slots.default?.() || []))

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

    function onFormReady(step: number, form: any) {
      formInstances.value[step] = form
      if (props.formMapRef)
        props.formMapRef.value = formInstances.value
      if (step === current.value && props.formRef)
        props.formRef.value = form
    }

    async function onStepFinish(name: string, values: Record<string, any>) {
      const nextValues = new Map(formValues.value)
      nextValues.set(name, values)
      formValues.value = nextValues

      const isLastStep = current.value === stepItems.value.length - 1
      if (!isLastStep) {
        setCurrent(current.value + 1)
        return
      }

      loading.value = true
      try {
        const merged = mergeValues(Array.from(nextValues.values()))
        const result = await props.onFinish?.(merged as any)
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
          class="ant-pro-steps-form-steps-container"
          style={{ maxWidth: `${Math.min(items.length * 320, 1160)}px` }}
        >
          <Steps
            {...(props.stepsProps || {})}
            items={items as any}
            current={current.value}
            onChange={(nextStep: number) => {
              if (props.allowStepSelect)
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
              <Button key="pre" {...(submitter.resetButtonProps || {}) as any} onClick={prePage}>
                {preText}
              </Button>
            )
          : null,
        <Button
          key="submit"
          type="primary"
          loading={loading.value}
          {...(submitter.submitButtonProps || {}) as any}
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
              'ant-pro-steps-form-step',
              active ? 'ant-pro-steps-form-step-active' : '',
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
        <div class="ant-pro-steps-form-container" style={props.containerStyle}>
          {renderForms()}
          {props.stepsFormRender ? null : <Space>{submitterDom}</Space>}
        </div>
      )
      const layoutDom = renderLayout(renderStepsDom(), formContainer)
      const content = props.stepsFormRender ? props.stepsFormRender(layoutDom, submitterDom) : layoutDom

      return h('div', { class: 'ant-pro-steps-form' }, content as any)
    }
  },
})

const StepsForm = StepsFormInner as typeof StepsFormInner & {
  StepForm: typeof StepForm
}

StepsForm.StepForm = StepForm

export default StepsForm
export { StepForm, StepsForm }
export type { StepFormProps }
