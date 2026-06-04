import type { DatePickerProps } from 'antdv-next'
import type { FunctionalComponent } from 'vue'
import type { ProFormFieldItemProps } from '../../typing'
import { BaseDatePicker } from './BaseDatePicker'

export type ProFormDatePickerQuarterProps = Omit<ProFormFieldItemProps<DatePickerProps>, 'valueType'>

const valueType = 'dateQuarter' as const

const ProFormDatePickerQuarter: FunctionalComponent<ProFormDatePickerQuarterProps> = (props, { slots }) => (
  <BaseDatePicker valueType={valueType} {...props}>
    {slots.default?.()}
  </BaseDatePicker>
)

export default ProFormDatePickerQuarter
