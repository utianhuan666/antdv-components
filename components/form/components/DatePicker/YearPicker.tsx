import type { DatePickerProps } from 'antdv-next'
import type { FunctionalComponent } from 'vue'
import type { ProFormFieldItemProps } from '../../typing'
import { BaseDatePicker } from './BaseDatePicker'

export type ProFormDatePickerYearProps = Omit<ProFormFieldItemProps<DatePickerProps>, 'valueType'>

const valueType = 'dateYear' as const

const ProFormDatePickerYear: FunctionalComponent<ProFormDatePickerYearProps> = (props, { slots }) => (
  <BaseDatePicker valueType={valueType} {...props}>
    {slots.default?.()}
  </BaseDatePicker>
)

export default ProFormDatePickerYear
