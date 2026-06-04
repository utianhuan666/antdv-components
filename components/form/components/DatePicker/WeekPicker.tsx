import type { WeekPickerProps } from 'antdv-next'
import type { FunctionalComponent } from 'vue'
import type { ProFormFieldItemProps } from '../../typing'
import { BaseDatePicker } from './BaseDatePicker'

export type ProFormDatePickerWeekProps = Omit<ProFormFieldItemProps<WeekPickerProps>, 'valueType'>

const valueType = 'dateWeek' as const

const ProFormDatePickerWeek: FunctionalComponent<ProFormDatePickerWeekProps> = (props, { slots }) => (
  <BaseDatePicker valueType={valueType} {...props}>
    {slots.default?.()}
  </BaseDatePicker>
)

export default ProFormDatePickerWeek
