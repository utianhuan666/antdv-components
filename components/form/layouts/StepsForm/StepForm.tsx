import type { PropType, VNodeChild } from 'vue'
import type { CommonFormProps } from '../../typing'
import { defineComponent, shallowRef } from 'vue'
import { BaseForm } from '../../BaseForm'

export interface StepFormProps<T = Record<string, any>, U = Record<string, any>> extends CommonFormProps<T, U> {
  step?: number
  title?: VNodeChild
  stepProps?: Record<string, any>
  active?: boolean
  onStepFinish?: (name: string, values: Record<string, any>) => void
  onFormReady?: (step: number, form: any) => void
}

const StepForm = defineComponent({
  name: 'StepForm',
  inheritAttrs: false,
  props: {
    name: { type: [String, Number], default: undefined },
    step: { type: Number, default: 0 },
    title: { type: null as unknown as PropType<VNodeChild>, default: undefined },
    stepProps: { type: Object as PropType<Record<string, any>>, default: undefined },
    active: { type: Boolean, default: false },
    onStepFinish: { type: Function as PropType<StepFormProps['onStepFinish']>, default: undefined },
    onFormReady: { type: Function as PropType<StepFormProps['onFormReady']>, default: undefined },
    onFinish: { type: Function as PropType<CommonFormProps['onFinish']>, default: undefined },
  },
  setup(props, { attrs, slots, expose }) {
    const baseRef = shallowRef<any>()

    expose({
      get formInstance() {
        return baseRef.value?.formInstance
      },
      submit: () => baseRef.value?.submit?.(),
      reset: () => baseRef.value?.reset?.(),
      getFieldsValue: () => baseRef.value?.getFieldsValue?.(),
      getFieldsFormatValue: (allData?: true, omitNil?: boolean) => baseRef.value?.getFieldsFormatValue?.(allData, omitNil),
      setFieldsValue: (values: Record<string, any>) => baseRef.value?.setFieldsValue?.(values),
    })

    return () => (
      <BaseForm
        ref={baseRef}
        layout="vertical"
        {...attrs}
        submitter={false}
        onInit={(values, form) => {
          props.onFormReady?.(props.step, baseRef.value || form)
          ;(attrs as any).onInit?.(values, form)
        }}
        onFinish={async (values: Record<string, any>) => {
          const result = await props.onFinish?.(values as any)
          if (result === false)
            return false
          props.onStepFinish?.(String(props.name ?? props.step), values)
          return result
        }}
      >
        {slots.default?.()}
      </BaseForm>
    )
  },
})

export default StepForm
export { StepForm }
