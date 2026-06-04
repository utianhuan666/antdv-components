import type { FormProps, StepsProps } from 'antdv-next'
import type { FunctionalComponent, VNodeChild } from 'vue'
import type { CommonFormProps, FormData, FormRefLike } from '../../typing'
import { defineComponent, shallowRef } from 'vue'
import { BaseForm } from '../../BaseForm'

export type StepFormProps<T extends FormData = FormData, U = FormData> = Omit<FormProps, 'onFinish' | 'form'> & Omit<CommonFormProps<T, U>, 'submitter' | 'form'> & {
  step?: number
  title?: VNodeChild
  stepProps?: NonNullable<StepsProps['items']>[number]
  active?: boolean
  onStepFinish?: (name: string, values: T) => void
  onFormReady?: (step: number, form: FormRefLike) => void
}

const stepFormPropNames = [
  'name',
  'step',
  'title',
  'stepProps',
  'active',
  'onStepFinish',
  'onFormReady',
  'onFinish',
] as const

const StepFormImpl = defineComponent({
  name: 'StepForm',
  inheritAttrs: false,
  props: [...stepFormPropNames],
  setup(rawProps, { attrs, slots, expose }) {
    const props = rawProps as Readonly<StepFormProps>
    const baseRef = shallowRef<FormRefLike>()
    const onFormReady = () => props.onFormReady ?? (attrs.onFormReady as StepFormProps['onFormReady'] | undefined)
    const onStepFinish = () => props.onStepFinish ?? (attrs.onStepFinish as StepFormProps['onStepFinish'] | undefined)
    const onFinish = () => props.onFinish ?? (attrs.onFinish as StepFormProps['onFinish'] | undefined)

    expose({
      get formInstance() {
        return baseRef.value?.formInstance
      },
      submit: () => baseRef.value?.submit?.(),
      reset: () => baseRef.value?.reset?.(),
      getFieldsValue: () => baseRef.value?.getFieldsValue?.(),
      getFieldsFormatValue: (allData?: true, omitNil?: boolean) => baseRef.value?.getFieldsFormatValue?.(allData, omitNil),
      setFieldsValue: (values: FormData) => baseRef.value?.setFieldsValue?.(values),
    })

    return () => (
      <BaseForm
        ref={baseRef}
        layout="vertical"
        {...attrs}
        submitter={false}
        onInit={(values, form) => {
          onFormReady()?.(props.step ?? 0, baseRef.value || form)
          ;(attrs as { onInit?: CommonFormProps['onInit'] }).onInit?.(values, form)
        }}
        onFinish={async (values: FormData) => {
          const result = await (onFinish() as ((values: FormData) => ReturnType<NonNullable<CommonFormProps['onFinish']>>) | undefined)?.(values)
          if (result === false)
            return false
          onStepFinish()?.(String(props.name ?? props.step), values)
          return result
        }}
      >
        {slots.default?.()}
      </BaseForm>
    )
  },
})

const StepForm = StepFormImpl as unknown as FunctionalComponent<StepFormProps>

export default StepForm
export { StepForm }
