import type { RadioGroupProps, RadioProps } from 'antdv-next'
import type { ProFormFieldItemProps } from '../../typing'
import { Radio, RadioButton } from 'antdv-next'
import { defineComponent } from 'vue'
import { mergeFieldProps, omitKeys, renderFormItem } from '../_util'
import { defineProFormField } from '../FormItem/warpField'

export type ProFormRadioGroupProps = ProFormFieldItemProps<RadioGroupProps> & {
  layout?: 'horizontal' | 'vertical'
  radioType?: 'button' | 'radio'
  options?: RadioGroupProps['options']
}

const RadioGroup = defineProFormField<ProFormRadioGroupProps>(
  'ProFormRadioGroup',
  props => props.radioType === 'button' ? 'radioButton' : 'radio',
  props => ({
    options: props.options,
    layout: props.layout,
    radioType: props.radioType,
  }),
)

export const ProFormRadioGroup = RadioGroup

const ProFormRadio = defineComponent({
  name: 'ProFormRadio',
  inheritAttrs: false,
  setup(props: ProFormFieldItemProps<RadioProps>, { attrs, slots }) {
    return () => {
      const current = { ...attrs, ...props } as ProFormFieldItemProps<RadioProps>
      const fieldProps = omitKeys(mergeFieldProps(current), ['allowClear'])
      const dom = <Radio {...fieldProps}>{slots.default?.()}</Radio>
      return renderFormItem(current, dom, { valuePropName: 'checked' })
    }
  },
}) as any

ProFormRadio.Group = RadioGroup
ProFormRadio.Button = RadioButton
ProFormRadio.displayName = 'ProFormComponent'

export default ProFormRadio as typeof ProFormRadio & {
  Group: typeof RadioGroup
  Button: typeof RadioButton
}
