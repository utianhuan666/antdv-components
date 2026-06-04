import type { DatePickerProps } from 'antdv-next'
import type { FunctionalComponent } from 'vue'
import type { ProFormFieldItemProps } from '../../typing'
import { BaseDatePicker } from './BaseDatePicker'

export type ProFormDatePickerMonthProps = Omit<ProFormFieldItemProps<DatePickerProps>, 'valueType'>

const valueType = 'dateMonth' as const

const ProFormDatePickerMonth: FunctionalComponent<ProFormDatePickerMonthProps> = (props, { slots }) => (
  <BaseDatePicker valueType={valueType} {...props}>
    {slots.default?.()}
  </BaseDatePicker>
)

export default ProFormDatePickerMonth
