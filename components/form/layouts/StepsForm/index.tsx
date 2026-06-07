import type { FormInstance, StepsProps } from 'antdv-next'
import type { CSSProperties, Ref, VNodeChild } from 'vue'
import type { ProFormInstance } from '../../BaseForm'
import type { SubmitterProps } from '../../BaseForm/Submitter'
import type { ProFormProps } from '../ProForm'
import { clsx } from '@v-c/util'
import { Button, Col, Row, Space, Steps } from 'antdv-next'
import { computed, defineComponent, inject, provide, ref, watchEffect } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import { merge } from '../../../utils'
import { cloneElement, flattenChildren, getVNodeProps, setRefValue } from '../_shared/vueHelpers'
import { StepFormContextKey, StepsFormContextKey } from './context'
import StepForm from './StepForm'
import { useStyle } from './style'

export interface StepsFormRef {
  getAllFieldsValue: () => Record<string, any>
  getAllFieldsFormatValue: (omitNil?: boolean) => Record<string, any>
  getCurrentStep: () => number
  setCurrentStep: (stepIndex: number) => void
  getStepFormInstance: (stepIndex: number) => ProFormInstance | undefined
  resetSteps: () => void
}

export interface StepsFormProps<T = Record<string, any>> {
  onFinish?: (values: T) => Promise<boolean | void> | boolean | void
  current?: number
  stepsProps?: StepsProps
  formProps?: ProFormProps<T>
  onCurrentChange?: (current: number) => void
  stepsRender?: (steps: { key: string, title?: VNodeChild }[], defaultDom: VNodeChild) => VNodeChild
  formRef?: Ref<ProFormInstance | undefined | null> | { current?: ProFormInstance | undefined | null }
  stepsFormRef?: Ref<StepsFormRef | undefined | null> | { current?: StepsFormRef | undefined | null }
  formMapRef?: Ref<Ref<FormInstance | undefined>[]> | { current?: Ref<FormInstance | undefined>[] }
  allowStepSelect?: boolean
  stepFormRender?: (form: VNodeChild) => VNodeChild
  stepsFormRender?: (form: VNodeChild, submitter: VNodeChild) => VNodeChild
  submitter?: SubmitterProps<{ step: number, onPre: () => void, form?: FormInstance }> | false
  containerStyle?: CSSProperties
  layoutRender?: (layoutDom: { stepsDom: VNodeChild, formDom: VNodeChild }) => VNodeChild
}

export function useStepsFormContext() {
  const ctx = inject(StepsFormContextKey, undefined)
  if (!ctx)
    throw new Error('[@ant-design/pro-components] useStepsFormContext must be used within StepsForm')
  return ctx
}

const StepFormProvider = defineComponent({
  name: 'StepFormProvider',
  props: ['value', 'child'],
  setup(props) {
    provide(StepFormContextKey, props.value as any)
    return () => props.child as VNodeChild
  },
})

function renderDefaultLayout(orientation: StepsProps['orientation'], dom: { stepsDom: VNodeChild, formDom: VNodeChild }) {
  if (orientation === 'vertical') {
    return (
      <Row align="stretch" wrap gutter={{ xs: 8, sm: 16, md: 24 }}>
        <Col xxl={4} xl={6} lg={7} md={8} sm={10} xs={12}>{dom.stepsDom}</Col>
        <Col>{dom.formDom}</Col>
      </Row>
    )
  }
  return (
    <>
      <Row gutter={{ xs: 8, sm: 16, md: 24 }}><Col span={24}>{dom.stepsDom}</Col></Row>
      <Row gutter={{ xs: 8, sm: 16, md: 24 }}><Col span={24}>{dom.formDom}</Col></Row>
    </>
  )
}

const StepsFormInner = defineComponent({
  name: 'StepsForm',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    const formDataRef = ref(new Map<string, Record<string, any>>())
    const formMapRef = ref(new Map<string, any>())
    const formArrayRef = ref<Ref<FormInstance | undefined>[]>([])
    const formArray = ref<string[]>([])
    const loading = ref(false)
    const step = ref((attrs.current as number | undefined) ?? 0)
    const prefixCls = useProPrefixCls('pro-steps-form')
    const { wrapSSR, hashId } = useStyle(prefixCls.value)
    const lastStep = computed(() => step.value === formArray.value.length - 1)
    const stepCount = computed(() => formArray.value.length)

    const setStep = (nextStep: number) => {
      step.value = nextStep
      ;(attrs as StepsFormProps).onCurrentChange?.(nextStep)
    }
    const setCurrentStepSafe = (index: number) => {
      if (index < 0 || index >= formArrayRef.value.length)
        return
      setStep(index)
    }
    const nextPage = () => {
      if (formArray.value.length === 0 || step.value > formArray.value.length - 2)
        return
      setStep(step.value + 1)
    }
    const prePage = () => {
      if (step.value > 0)
        setStep(step.value - 1)
    }
    const onSubmit = () => {
      formArrayRef.value[step.value]?.value?.submit?.()
    }

    provide(StepsFormContextKey, {
      regForm: (name: string, props: any) => {
        if (!formMapRef.value.has(name))
          formArray.value = [...formArray.value, name]
        formMapRef.value.set(name, props)
      },
      unRegForm: (name: string) => {
        formArray.value = formArray.value.filter(item => item !== name)
        formMapRef.value.delete(name)
        formDataRef.value.delete(name)
      },
      onFormFinish: async (name: string, formData: any) => {
        const props = attrs as StepsFormProps
        formDataRef.value.set(name, formData)
        if (!lastStep.value || !props.onFinish)
          return
        loading.value = true
        try {
          const values = merge({}, ...Array.from(formDataRef.value.values()))
          const success = await props.onFinish(values)
          if (success) {
            setStep(0)
            formArrayRef.value.forEach(form => form.value?.resetFields?.())
          }
        }
        finally {
          loading.value = false
        }
      },
      keyArray: formArray,
      formArrayRef,
      loading,
      setLoading: (nextLoading: boolean) => {
        loading.value = nextLoading
      },
      lastStep,
      formMapRef,
      next: nextPage,
      current: step,
      stepCount,
      setCurrent: setCurrentStepSafe,
    })

    watchEffect(() => {
      const props = attrs as StepsFormProps
      if (props.current !== undefined && props.current !== step.value)
        step.value = props.current
      setRefValue(props.formMapRef as any, formArrayRef.value)
      setRefValue(props.formRef as any, formArrayRef.value[step.value]?.value as ProFormInstance | undefined)
      setRefValue(props.stepsFormRef as any, {
        getAllFieldsValue: () => merge({}, ...formArrayRef.value.map(form => form.value?.getFieldsValue?.(true)).filter(Boolean)),
        getAllFieldsFormatValue: (omitNil?: boolean) => merge({}, ...formArrayRef.value.map(form => (form.value as any)?.getFieldsFormatValue?.(true, omitNil)).filter(Boolean)),
        getCurrentStep: () => step.value,
        setCurrentStep: setCurrentStepSafe,
        getStepFormInstance: (index: number) => formArrayRef.value[index]?.value as ProFormInstance | undefined,
        resetSteps: () => {
          formDataRef.value.clear()
          setStep(0)
          formArrayRef.value.forEach(form => form.value?.resetFields?.())
        },
      })
    })

    return () => {
      const props = attrs as StepsFormProps
      const children = flattenChildren(slots.default?.())
      const stepsDom = (
        <div class={`${prefixCls.value}-steps-container`} style={{ maxWidth: Math.min(formArray.value.length * 320, 1160) }}>
          <Steps
            {...props.stepsProps as any}
            items={formArray.value.map((item) => {
              const itemProps = formMapRef.value.get(item)
              return { key: item, title: itemProps?.title, ...(itemProps?.stepProps || {}) }
            })}
            current={step.value}
            onChange={(nextStep: number) => {
              if (props.allowStepSelect)
                setCurrentStepSafe(nextStep)
              props.stepsProps?.onChange?.(nextStep)
            }}
          />
        </div>
      )
      const submitter = props.submitter
      const submitterDom = (() => {
        if (submitter === false)
          return null
        const nextButton = (
          <Button
            type="primary"
            loading={loading.value}
            {...submitter?.submitButtonProps as any}
            onClick={() => {
              submitter?.onSubmit?.()
              onSubmit()
            }}
          >
            下一步
          </Button>
        )
        const preButton = (
          <Button
            {...submitter?.resetButtonProps as any}
            onClick={() => {
              prePage()
              submitter?.onReset?.()
            }}
          >
            上一步
          </Button>
        )
        const submitButton = (
          <Button
            type="primary"
            loading={loading.value}
            {...submitter?.submitButtonProps as any}
            onClick={() => {
              submitter?.onSubmit?.()
              onSubmit()
            }}
          >
            提交
          </Button>
        )
        const buttons = step.value < 1 ? (formArray.value.length === 1 ? [submitButton] : [nextButton]) : step.value + 1 === formArray.value.length ? [preButton, submitButton] : [preButton, nextButton]
        if (submitter?.render === false)
          return null
        if (submitter?.render)
          return submitter.render({ form: formArrayRef.value[step.value]?.value, onSubmit, step: step.value, onPre: prePage } as any, buttons)
        return buttons
      })()
      const formDom = children.map((item, index) => {
        const itemProps = getVNodeProps(item) as any
        const name = itemProps.name || `${index}`
        const isShow = step.value === index
        return (
          <div class={`${prefixCls.value}-step`} key={name} style={{ display: isShow ? undefined : 'none' }}>
            <StepFormProvider value={{ ...(props.formProps || {}), ...itemProps, name, step: index, submitter: false, contentRender: props.stepFormRender }} child={cloneElement(item)} />
          </div>
        )
      })
      const finalStepsDom = props.stepsRender ? props.stepsRender(formArray.value.map(item => ({ key: item, title: formMapRef.value.get(item)?.title })), stepsDom) : stepsDom
      const formContainer = (
        <div class={`${prefixCls.value}-container`} style={props.containerStyle}>
          {formDom}
          {props.stepsFormRender ? null : <Space>{submitterDom}</Space>}
        </div>
      )
      const layoutDom = { stepsDom: finalStepsDom, formDom: formContainer }
      const rendered = props.layoutRender ? props.layoutRender(layoutDom) : renderDefaultLayout(props.stepsProps?.orientation, layoutDom)
      return wrapSSR(<div class={clsx(prefixCls.value, hashId)}>{props.stepsFormRender ? props.stepsFormRender(rendered, submitterDom) : rendered}</div>)
    }
  },
})

export const StepsForm = StepsFormInner as any
StepsForm.StepForm = StepForm
StepsForm.useStepsFormContext = useStepsFormContext

export { StepForm }
export type { StepFormProps } from './StepForm'
export default StepsForm
