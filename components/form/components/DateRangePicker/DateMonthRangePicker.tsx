import type { RangePickerProps } from 'antdv-next'
import type { FunctionalComponent } from 'vue'
import type { ProFormFieldItemProps } from '../../typing'
import { BaseDateRanger } from './BaseDateRanger'

export type ProFormDateMonthRangePickerProps = Omit<ProFormFieldItemProps<RangePickerProps>, 'valueType'>

const valueType = 'dateMonthRange' as const

export const ProFormDateMonthRangePicker: FunctionalComponent<ProFormDateMonthRangePickerProps> = (props, { slots }) => (
  <BaseDateRanger valueType={valueType} {...props}>
    {slots.default?.()}
  </BaseDateRanger>
)
