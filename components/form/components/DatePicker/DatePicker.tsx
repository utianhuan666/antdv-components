import type { DatePickerProps } from 'antdv-next'
import type { FunctionalComponent } from 'vue'
import type { ProFormFieldItemProps } from '../../typing'
import { BaseDatePicker } from './BaseDatePicker'

export type ProFormDatePickerProps = Omit<ProFormFieldItemProps<DatePickerProps>, 'valueType'>

const valueType = 'date' as const

const ProFormDatePicker: FunctionalComponent<ProFormDatePickerProps> = (props, { slots }) => (
  <BaseDatePicker valueType={valueType} {...props}>
    {slots.default?.()}
  </BaseDatePicker>
)

export default ProFormDatePicker
