import type { CheckboxGroupProps, CheckboxProps } from 'antdv-next'
import type { ProFormFieldItemProps } from '../../typing'
import { Checkbox } from 'antdv-next'
import { defineComponent } from 'vue'
import { mergeFieldProps, omitKeys, renderFormItem } from '../_util'
import { defineProFormField } from '../FormItem/warpField'

export type ProFormCheckboxGroupProps = ProFormFieldItemProps<CheckboxGroupProps> & {
  layout?: 'horizontal' | 'vertical'
  options?: CheckboxGroupProps['options']
}

export type ProFormCheckboxProps = ProFormFieldItemProps<CheckboxProps>

const CheckboxGroup = defineProFormField(
  'ProFormCheckboxGroup',
  'checkbox',
  props => ({
    options: props.options,
    layout: props.layout,
  }),
)

export const ProFormCheckboxGroup = CheckboxGroup

const ProFormCheckbox = defineComponent({
  name: 'ProFormCheckbox',
  inheritAttrs: false,
  setup(props: ProFormCheckboxProps, { attrs, slots }) {
    return () => {
      const current = { ...attrs, ...props } as ProFormCheckboxProps
      const fieldProps = omitKeys(mergeFieldProps(current), ['allowClear'])
      const dom = <Checkbox {...fieldProps}>{slots.default?.()}</Checkbox>
      return renderFormItem(current, dom, { valuePropName: 'checked' })
    }
  },
}) as any

ProFormCheckbox.Group = CheckboxGroup
ProFormCheckbox.displayName = 'ProFormComponent'

export default ProFormCheckbox as typeof ProFormCheckbox & {
  Group: typeof CheckboxGroup
}
