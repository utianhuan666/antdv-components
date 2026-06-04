import type { RangePickerProps } from 'antdv-next'
import type { FunctionalComponent } from 'vue'
import type { ProFormFieldItemProps } from '../../typing'
import { BaseDateRanger } from './BaseDateRanger'

export type ProFormDateTimeRangePickerProps = Omit<ProFormFieldItemProps<RangePickerProps>, 'valueType'>

const valueType = 'dateTimeRange' as const

export const ProFormDateTimeRangePicker: FunctionalComponent<ProFormDateTimeRangePickerProps> = (props, { slots }) => (
  <BaseDateRanger valueType={valueType} {...props}>
    {slots.default?.()}
  </BaseDateRanger>
)
