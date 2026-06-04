import type { InputNumberProps } from 'antdv-next'
import type { FunctionalComponent } from 'vue'
import type { FieldMoneyProps } from '../../../field'
import type { ProFormFieldItemProps } from '../../typing'
import ProFormField from '../Field'

export type ProFormMoneyProps = ProFormFieldItemProps<
  Omit<FieldMoneyProps, 'valueType' | 'text'> & InputNumberProps
> & {
  customSymbol?: string
  locale?: string
  min?: InputNumberProps['min']
  max?: InputNumberProps['max']
  placeholder?: string
}

const ProFormMoney: FunctionalComponent<ProFormMoneyProps> = (props, { slots }) => (
  <ProFormField valueType="money" {...props}>
    {slots.default?.()}
  </ProFormField>
)

ProFormMoney.displayName = 'ProFormMoney'
ProFormMoney.inheritAttrs = false

export default ProFormMoney
