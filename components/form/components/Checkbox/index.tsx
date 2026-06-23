import type { CheckboxGroupProps, CheckboxProps } from 'antdv-next'
import type { FieldCheckboxExpose } from '../../../field'
import type { ProFormFieldItemProps, ProFormFieldRemoteProps } from '../../typing'
import { Checkbox } from 'antdv-next'
import { defineComponent, ref } from 'vue'
import { FieldCheckbox } from '../../../field'
import { ProConfigProvider } from '../../../provider'
import { runFunction } from '../../../utils'
import { createRefProxy } from '../../../utils/createRefProxy'
import { useFieldContext } from '../../FieldContext'
import { mergeFieldProps, omitKeys, renderFormItem } from '../_util'
import ProFormField from '../Field'
import { proFormFieldPropNames } from '../FormItem/warpField'

export type ProFormCheckboxGroupProps = ProFormFieldItemProps<CheckboxGroupProps> & {
  layout?: 'horizontal' | 'vertical'
  options?: CheckboxGroupProps['options']
} & ProFormFieldRemoteProps

export type ProFormCheckboxProps = ProFormFieldItemProps<CheckboxProps>
type CheckboxInstance = InstanceType<typeof Checkbox>
export type ProFormCheckboxRef = Partial<CheckboxInstance>
type CheckboxGroupExpose = FieldCheckboxExpose
const checkboxGroupPropNames = [...proFormFieldPropNames, 'layout', 'options'] as const

const CheckboxGroup = defineComponent<ProFormCheckboxGroupProps>({
  name: 'ProFormCheckboxGroup',
  inheritAttrs: false,
  props: checkboxGroupPropNames as any,
  setup(rawProps, { expose }) {
    const props = rawProps as ProFormCheckboxGroupProps
    const innerRef = ref<CheckboxGroupExpose | null>(null)

    expose(createRefProxy<CheckboxGroupExpose>(innerRef))

    return () => {
      const current = props
      return (
        <ProConfigProvider
          valueTypeMap={{
            checkbox: {
              render: (text, currentProps) => <FieldCheckbox {...currentProps} text={text} layout={current.layout} />,
              formItemRender: (text, currentProps) => <FieldCheckbox {...currentProps} text={text} layout={current.layout} />,
            },
          }}
        >
          <ProFormField
            ref={innerRef}
            {...current}
            valueType="checkbox"
            valueEnum={runFunction(current.valueEnum)}
            fieldProps={{
              options: current.options,
              ...(current.fieldProps || {}),
            }}
            proFieldProps={current.proFieldProps}
          />
        </ProConfigProvider>
      )
    }
  },
})

export const ProFormCheckboxGroup = CheckboxGroup

const ProFormCheckbox = defineComponent<ProFormCheckboxProps>({
  name: 'ProFormCheckbox',
  inheritAttrs: false,
  props: proFormFieldPropNames,
  setup(rawProps: ProFormCheckboxProps, { slots, expose }) {
    const props = rawProps
    const fieldContext = useFieldContext()
    const innerRef = ref<CheckboxInstance | null>(null)

    expose(createRefProxy<CheckboxInstance>(innerRef))

    return () => {
      const current = { ...props, valuePropName: 'checked' as const }
      const fieldProps = omitKeys(mergeFieldProps(current, {}, fieldContext), ['allowClear'])
      const dom = <Checkbox ref={innerRef} {...fieldProps}>{slots.default?.()}</Checkbox>
      return renderFormItem(current, dom, { valuePropName: 'checked' })
    }
  },
})

ProFormCheckbox.Group = CheckboxGroup

export default ProFormCheckbox as typeof ProFormCheckbox & {
  Group: typeof CheckboxGroup
}
