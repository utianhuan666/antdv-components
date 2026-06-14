import type { FormInstance, FormProps, StepsProps } from 'antdv-next'
import type { ProFormProps } from '../ProForm'
import type { StepsFormProps } from './index'
import { omit } from '@v-c/util'
import { defineComponent, inject, onMounted, onUnmounted, ref } from 'vue'
import BaseForm from '../../BaseForm'
import { setRefValue } from '../_shared/vueHelpers'
import { StepFormContextKey, StepsFormContextKey } from './context'

export type StepFormProps<T = Record<string, any>, U = Record<string, any>> = {
  step?: number
  stepProps?: NonNullable<StepsProps['items']>[number]
  index?: number
} & Omit<FormProps, 'onFinish' | 'form'> & Omit<ProFormProps<T, U>, 'submitter' | 'form'>

const StepForm = defineComponent<StepFormProps>(
  (stepNativeProps, { slots }) => {
    const formRef = ref<FormInstance>()
    const stepsContext = inject(StepsFormContextKey, undefined)
    const stepContext = inject(StepFormContextKey, null)
    const getMergedProps = () => ({ ...stepNativeProps, ...(stepContext || {}) }) as StepFormProps & StepsFormProps<any>

    onMounted(() => {
      const props = getMergedProps()
      if (props.name || props.step !== undefined)
        stepsContext?.regForm(String(props.name ?? props.step), props)
    })

    onUnmounted(() => {
      const props = getMergedProps()
      if (props.name || props.step !== undefined)
        stepsContext?.unRegForm(String(props.name ?? props.step))
    })

    return () => {
      const props = getMergedProps()
      const { onFinish, step, formRef: propFormRef, stepProps, ...restProps } = props
      if (stepsContext?.formArrayRef)
        stepsContext.formArrayRef.value[step || 0] = formRef
      const baseFormProps = omit(restProps, ['layoutType', 'columns'] as any[])

      return (
        <BaseForm
          {...baseFormProps}
          formRef={formRef}
          layout="vertical"
          onFinish={async (values) => {
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
          onInit={(values, form) => {
            formRef.value = form
            setRefValue(propFormRef, form)
            if (stepsContext?.formArrayRef)
              stepsContext.formArrayRef.value[step || 0] = formRef
            restProps?.onInit?.(values, form)
          }}
        >
          {slots.default?.()}
        </BaseForm>
      )
    }
  },
  {
    name: 'StepForm',
    inheritAttrs: false,
  },
)

export default StepForm
