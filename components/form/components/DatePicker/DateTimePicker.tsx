import type { DatePickerProps } from 'antdv-next'
import type { FunctionalComponent } from 'vue'
import type { ProFormFieldItemProps } from '../../typing'
import { BaseDatePicker } from './BaseDatePicker'

export type ProFormDateTimePickerProps = Omit<ProFormFieldItemProps<DatePickerProps>, 'valueType'>

const valueType = 'dateTime' as const

const ProFormDateTimePicker: FunctionalComponent<ProFormDateTimePickerProps> = (props, { slots }) => (
  <BaseDatePicker valueType={valueType} {...props}>
    {slots.default?.()}
  </BaseDatePicker>
)

export default ProFormDateTimePicker
