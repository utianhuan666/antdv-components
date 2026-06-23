import type { InputNumberProps } from 'antdv-next'
import type { ProFormFieldItemProps } from '../../typing'
import { defineProFormField } from '../FormItem/warpField'

export type ProFormDigitProps = ProFormFieldItemProps<InputNumberProps> & {
  min?: InputNumberProps['min']
  max?: InputNumberProps['max']
}

const ProFormDigit = defineProFormField<ProFormDigitProps>(
  'ProFormDigit',
  'digit',
  props => ({
    min: props.min,
    max: props.max,
  }),
)

export default ProFormDigit
