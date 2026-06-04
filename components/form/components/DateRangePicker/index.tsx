import type { RangePickerProps } from 'antdv-next'
import type { FunctionalComponent } from 'vue'
import type { ProFormFieldItemProps } from '../../typing'
import { BaseDateRanger } from './BaseDateRanger'
import { ProFormDateMonthRangePicker } from './DateMonthRangePicker'
import { ProFormDateQuarterRangePicker } from './DateQuarterRangePicker'
import { ProFormDateTimeRangePicker } from './DateTimeRangePicker'
import { ProFormDateWeekRangePicker } from './DateWeekRangePicker'
import { ProFormDateYearRangePicker } from './DateYearRangePicker'
import { ProFormTimeRangePicker } from './TimeRangePicker'

export type ProFormDateRangePickerProps = Omit<ProFormFieldItemProps<RangePickerProps>, 'valueType'>

const valueType = 'dateRange' as const

const ProFormDateRangePicker: FunctionalComponent<ProFormDateRangePickerProps> = (props, { slots }) => (
  <BaseDateRanger valueType={valueType} {...props}>
    {slots.default?.()}
  </BaseDateRanger>
)

export default ProFormDateRangePicker
export {
  ProFormDateMonthRangePicker,
  ProFormDateQuarterRangePicker,
  ProFormDateTimeRangePicker,
  ProFormDateWeekRangePicker,
  ProFormDateYearRangePicker,
  ProFormTimeRangePicker,
}
