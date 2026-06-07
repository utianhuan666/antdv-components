import type { FormProps, StepsProps } from 'antdv-next'
import type { ProFormProps } from '../ProForm'
import { defineComponent, inject, onMounted, onUnmounted, ref } from 'vue'
import BaseForm from '../../BaseForm'
import { StepFormContextKey, StepsFormContextKey } from './context'

export type StepFormProps<T = Record<string, any>, U = Record<string, any>> = {
  step?: number
  stepProps?: NonNullable<StepsProps['items']>[number]
  index?: number
} & Omit<FormProps, 'onFinish' | 'form'> & Omit<ProFormProps<T, U>, 'submitter' | 'form'>

const StepForm = defineComponent({
  name: 'StepForm',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    const formRef = ref<any>()
    const stepsContext = inject(StepsFormContextKey, undefined)
    const stepContext = inject(StepFormContextKey, null)

    onMounted(() => {
      const props = { ...(attrs as StepFormProps), ...(stepContext || {}) } as any
      if (props.name || props.step !== undefined)
        stepsContext?.regForm(String(props.name ?? props.step), props)
    })

    onUnmounted(() => {
      const props = { ...(attrs as StepFormProps), ...(stepContext || {}) } as any
      if (props.name || props.step !== undefined)
        stepsContext?.unRegForm(String(props.name ?? props.step))
    })

    return () => {
      const props = { ...(attrs as StepFormProps), ...(stepContext || {}) } as any
      const { onFinish, step, title, stepProps, ...restProps } = props
      if (stepsContext?.formArrayRef)
        stepsContext.formArrayRef.value[step || 0] = formRef

      return (
        <BaseForm
          {...restProps}
          formRef={formRef}
          layout="vertical"
          onFinish={async (values: Record<string, any>) => {
            if (restProps.name)
              stepsContext?.onFormFinish(String(restProps.name), values)
            if (onFinish) {
              stepsContext?.setLoading(true)
              try {
                const success = await onFinish(values)
                if (success)
                  stepsContext?.next()
              }
              finally {
                stepsContext?.setLoading(false)
              }
              return
            }
            if (!stepsContext?.lastStep.value)
              stepsContext?.next()
          }}
        >
          {slots.default?.()}
        </BaseForm>
      )
    }
  },
})

export default StepForm
