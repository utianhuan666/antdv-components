import type { InputNumberProps } from 'antdv-next'
import type { ProFormFieldItemProps } from '../../typing'
import { defineProFormField } from '../FormItem/warpField'

export type Value = string | number | undefined
export type ValuePair = Value[]

export type RangeInputNumberProps = Omit<
  InputNumberProps,
  'value' | 'defaultValue' | 'onChange' | 'placeholder'
> & {
  value?: ValuePair
  defaultValue?: ValuePair
  onChange?: (value?: ValuePair) => void
}

export type ProFormDigitRangeProps = ProFormFieldItemProps<RangeInputNumberProps> & {
  separator?: string
  separatorWidth?: number
}

const ProFormDigitRange = defineProFormField('ProFormDigitRange', 'digitRange')

export default ProFormDigitRange
