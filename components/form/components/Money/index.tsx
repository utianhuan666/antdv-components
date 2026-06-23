import type { InputNumberProps } from 'antdv-next'
import type { FieldMoneyProps } from '../../../field'
import type { ProFormFieldItemProps } from '../../typing'
import { defineProFormField } from '../FormItem/warpField'

export type ProFormMoneyProps = ProFormFieldItemProps<
  Omit<FieldMoneyProps, 'valueType' | 'text'> & InputNumberProps
> & {
  customSymbol?: string
  locale?: string
  min?: InputNumberProps['min']
  max?: InputNumberProps['max']
  placeholder?: string
}

const ProFormMoney = defineProFormField<ProFormMoneyProps>(
  'ProFormMoney',
  props => ({ type: 'money', locale: props.locale }),
  props => ({
    min: props.min,
    max: props.max,
    customSymbol: props.customSymbol,
  }),
)

export default ProFormMoney
