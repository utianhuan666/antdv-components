import type { InputNumberProps } from 'antdv-next'
import type { FunctionalComponent } from 'vue'
import type { ProFormFieldItemProps } from '../../typing'
import ProFormField from '../Field'

export type ProFormDigitProps = ProFormFieldItemProps<InputNumberProps> & {
  min?: InputNumberProps['min']
  max?: InputNumberProps['max']
}

const ProFormDigit: FunctionalComponent<ProFormDigitProps> = (props, { slots }) => (
  <ProFormField valueType="digit" {...props}>
    {slots.default?.()}
  </ProFormField>
)

ProFormDigit.displayName = 'ProFormDigit'
ProFormDigit.inheritAttrs = false

export default ProFormDigit
