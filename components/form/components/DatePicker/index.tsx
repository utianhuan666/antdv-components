import ProFormDatePickerBase from './DatePicker'
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

ProFormDatePicker.Week = ProFormDatePickerWeek
ProFormDatePicker.Month = ProFormDatePickerMonth
ProFormDatePicker.Quarter = ProFormDatePickerQuarter
ProFormDatePicker.Year = ProFormDatePickerYear

export default ProFormDatePicker
export {
  ProFormDatePickerMonth,
  ProFormDatePickerQuarter,
  ProFormDatePickerWeek,
  ProFormDatePickerYear,
  ProFormDateTimePicker,
  ProFormTimePicker,
}
