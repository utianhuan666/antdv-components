import type { CheckboxGroupProps, CheckboxProps } from 'antdv-next'
import type { FunctionalComponent } from 'vue'
import type { ProFormFieldItemProps } from '../../typing'
import ProFormField from '../Field'

export type ProFormCheckboxProps = ProFormFieldItemProps<CheckboxProps>

export type ProFormCheckboxGroupProps = ProFormFieldItemProps<CheckboxGroupProps> & {
  layout?: 'horizontal' | 'vertical'
  options?: CheckboxGroupProps['options']
}

const ProFormCheckboxBase: FunctionalComponent<ProFormCheckboxProps> = (props, { slots }) => (
  <ProFormField valueType="checkbox" valuePropName="checked" {...props}>
    {slots.default?.()}
  </ProFormField>
)

ProFormCheckboxBase.displayName = 'ProFormCheckbox'
ProFormCheckboxBase.inheritAttrs = false

const ProFormCheckboxGroup: FunctionalComponent<ProFormCheckboxGroupProps> = (props, { slots }) => (
  <ProFormField valueType="checkbox" {...props}>
    {slots.default?.()}
  </ProFormField>
)

ProFormCheckboxGroup.displayName = 'ProFormCheckboxGroup'
ProFormCheckboxGroup.inheritAttrs = false

const ProFormCheckbox = Object.assign(ProFormCheckboxBase, {
  Group: ProFormCheckboxGroup,
})

export default ProFormCheckbox
export { ProFormCheckboxGroup }
