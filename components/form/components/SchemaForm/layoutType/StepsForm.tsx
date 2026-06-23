import type { PropType } from 'vue'
import type { ProFormGridConfig } from '../../../typing'
import type { FormSchema, ProFormColumnsType, ProFormPropsType } from '../typing'
import { defineComponent } from 'vue'
import { StepsForm as ProStepsForm } from '../../../layouts/StepsForm'
import BetaSchemaForm from '../index'

type StepsFormProps<T, ValueType> = ProFormPropsType<T, ValueType>
  & Pick<FormSchema<T, ValueType>, 'steps'> & {
    layoutType: 'StepsForm'
    forceUpdate?: () => void
    grid?: ProFormGridConfig['grid']
  }

const StepsForm = defineComponent<StepsFormProps<any, any>>({
  name: 'SchemaStepsForm',
  inheritAttrs: false,
  props: ['steps', 'columns', 'forceUpdate', 'grid'],
  setup(rawProps, { attrs }) {
    const props = rawProps
    return () => (
      <ProStepsForm
        {...attrs as any}
        onCurrentChange={(current: number) => {
          ;(attrs as any).onCurrentChange?.(current)
          props.forceUpdate?.()
        }}
      >
        {props.steps?.map((step, index) => (
          <BetaSchemaForm
            grid={props.grid}
            {...step as any}
            key={index}
            layoutType="StepForm"
            columns={props.columns[index] || []}
          />
        ))}
      </ProStepsForm>
    )
  },
})

export default StepsForm
