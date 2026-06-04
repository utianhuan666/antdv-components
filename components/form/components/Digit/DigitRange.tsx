import type { InputNumberProps } from 'antdv-next'
import type { FunctionalComponent } from 'vue'
import type { ProFormFieldItemProps } from '../../typing'
import ProFormField from '../Field'

export type Value = string | number | undefined
export type ValuePair = Value[]
export type RangeInputNumberProps = Omit<InputNumberProps, 'value' | 'defaultValue' | 'onChange' | 'placeholder'> & {
  value?: ValuePair
  defaultValue?: ValuePair
  onChange?: (value?: ValuePair) => void
}

export type ProFormDigitRangeProps = ProFormFieldItemProps<RangeInputNumberProps> & {
  separator?: string
  separatorWidth?: number
}

const ProFormDigitRange: FunctionalComponent<ProFormDigitRangeProps> = (props, { slots }) => (
  <ProFormField valueType="digitRange" {...props}>
    {slots.default?.()}
  </ProFormField>
)

ProFormDigitRange.displayName = 'ProFormDigitRange'
ProFormDigitRange.inheritAttrs = false

export default ProFormDigitRange
