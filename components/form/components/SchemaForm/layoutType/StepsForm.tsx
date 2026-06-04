import type { DefineComponent } from 'vue'
import type { StepsSchemaFormProps } from '../typing'
import { Button, Steps } from 'antdv-next'
import { defineComponent, ref } from 'vue'
import ProForm from '../../../layouts/ProForm'

const stepsSchemaFormPropNames = [
  'steps',
  'columns',
  'formRef',
  'externalFormRef',
  'onCurrentChange',
  'renderColumns',
  'onFinish',
] as const

const StepsSchemaForm = defineComponent({
  name: 'SchemaStepsForm',
  inheritAttrs: false,
  props: [...stepsSchemaFormPropNames],
  emits: ['currentChange'],
  setup(rawProps, { attrs, emit }) {
    const props = rawProps as unknown as StepsSchemaFormProps
    const current = ref(0)
    const innerFormRef = ref<any>()
    const FormComponent = ProForm as any

    function setCurrent(value: number) {
      current.value = value
      props.onCurrentChange?.(value)
      emit('currentChange', value)
    }

    return () => (
      <FormComponent
        ref={(instance: any) => {
          innerFormRef.value = instance
          if (props.formRef)
            props.formRef.value = instance
          if (props.externalFormRef)
            props.externalFormRef.value = instance
        }}
        {...attrs}
        onFinish={props.onFinish as any}
      >
        <Steps current={current.value} items={(props.steps ?? []).map(item => ({ title: item.title as any }))} style={{ marginBottom: 24 }} />
        {props.renderColumns((props.columns ?? [])[current.value] || [], innerFormRef.value)}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          {current.value > 0 ? <Button onClick={() => setCurrent(current.value - 1)}>上一步</Button> : null}
          {current.value < (props.columns ?? []).length - 1
            ? <Button type="primary" onClick={() => setCurrent(current.value + 1)}>下一步</Button>
            : <Button type="primary" htmlType="submit">提交</Button>}
        </div>
      </FormComponent>
    )
  },
}) as unknown as DefineComponent<StepsSchemaFormProps>

export default StepsSchemaForm
