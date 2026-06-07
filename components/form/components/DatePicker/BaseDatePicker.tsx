import type { DatePickerProps } from 'antdv-next'
import type { ProFormFieldItemProps } from '../../typing'
import { defineProFormField } from '../FormItem/warpField'

export type ProFormDateValueType
  = | 'date'
    | 'dateTime'
    | 'dateWeek'
    | 'dateMonth'
    | 'dateQuarter'
    | 'dateYear'
    | 'time'

export interface BaseDatePickerProps extends ProFormFieldItemProps<DatePickerProps> {
  valueType: ProFormDateValueType
}

const presets: Record<ProFormDateValueType, Record<string, any>> = {
  date: { format: 'YYYY-MM-DD' },
  dateTime: { format: 'YYYY-MM-DD HH:mm:ss', showTime: true },
  dateWeek: { format: 'gggg-wo', picker: 'week' },
  dateMonth: { format: 'YYYY-MM', picker: 'month' },
  dateQuarter: { format: 'YYYY-[Q]Q', picker: 'quarter' },
  dateYear: { format: 'YYYY', picker: 'year' },
  time: { format: 'HH:mm:ss' },
}

export function createDatePicker(name: string, valueType: ProFormDateValueType) {
  return defineProFormField(name, valueType, () => presets[valueType])
}

export const BaseDatePicker = createDatePicker('BaseDatePicker', 'date')
