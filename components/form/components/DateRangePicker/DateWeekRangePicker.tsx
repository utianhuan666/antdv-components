import type { RangePickerProps } from 'antdv-next'
import type { FunctionalComponent } from 'vue'
import type { ProFormFieldItemProps } from '../../typing'
import { BaseDateRanger } from './BaseDateRanger'

export type ProFormDateWeekRangePickerProps = Omit<ProFormFieldItemProps<RangePickerProps>, 'valueType'>

const valueType = 'dateWeekRange' as const

export const ProFormDateWeekRangePicker: FunctionalComponent<ProFormDateWeekRangePickerProps> = (props, { slots }) => (
  <BaseDateRanger valueType={valueType} {...props}>
    {slots.default?.()}
  </BaseDateRanger>
)
