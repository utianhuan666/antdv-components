import type { RangePickerProps } from 'antdv-next'
import type { FunctionalComponent } from 'vue'
import type { ProFormFieldItemProps } from '../../typing'
import { BaseDateRanger } from './BaseDateRanger'

export type ProFormDateQuarterRangePickerProps = Omit<ProFormFieldItemProps<RangePickerProps>, 'valueType'>

const valueType = 'dateQuarterRange' as const

export const ProFormDateQuarterRangePicker: FunctionalComponent<ProFormDateQuarterRangePickerProps> = (props, { slots }) => (
  <BaseDateRanger valueType={valueType} {...props}>
    {slots.default?.()}
  </BaseDateRanger>
)
