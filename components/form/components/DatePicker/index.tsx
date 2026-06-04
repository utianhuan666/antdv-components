import ProFormDatePickerBase from './DatePicker'
import { ProFormTimeRangePicker } from '../DateRangePicker'
import ProFormDateTimePicker from './DateTimePicker'
import ProFormDatePickerMonth from './MonthPicker'
import ProFormDatePickerQuarter from './QuarterPicker'
import ProFormTimePicker from './TimePicker'
import ProFormDatePickerWeek from './WeekPicker'
import ProFormDatePickerYear from './YearPicker'

const ProFormDatePicker = ProFormDatePickerBase as typeof ProFormDatePickerBase & {
  Week: typeof ProFormDatePickerWeek
  Month: typeof ProFormDatePickerMonth
  Quarter: typeof ProFormDatePickerQuarter
  Year: typeof ProFormDatePickerYear
}

;(ProFormDatePicker as any).Week = ProFormDatePickerWeek
;(ProFormDatePicker as any).Month = ProFormDatePickerMonth
;(ProFormDatePicker as any).Quarter = ProFormDatePickerQuarter
;(ProFormDatePicker as any).Year = ProFormDatePickerYear
;(ProFormTimePicker as any).RangePicker = ProFormTimeRangePicker

export default ProFormDatePicker
export {
  ProFormDateTimePicker,
  ProFormTimePicker,
  ProFormDatePickerMonth,
  ProFormDatePickerQuarter,
  ProFormDatePickerWeek,
  ProFormDatePickerYear,
}
