import type { RangePickerProps } from 'antdv-next'
import type { ProFormFieldItemProps } from '../../typing'
import { defineProFormField } from '../FormItem/warpField'

export type ProFormDateRangeValueType
  = | 'dateRange'
    | 'dateTimeRange'
    | 'dateWeekRange'
    | 'dateMonthRange'
    | 'dateQuarterRange'
    | 'dateYearRange'
    | 'timeRange'

export interface BaseDateRangerProps extends ProFormFieldItemProps<RangePickerProps> {
  valueType: ProFormDateRangeValueType
}

const presets: Record<ProFormDateRangeValueType, Record<string, any>> = {
  dateRange: { format: 'YYYY-MM-DD' },
  dateTimeRange: { format: 'YYYY-MM-DD HH:mm:ss', showTime: true },
  dateWeekRange: { format: 'gggg-wo', picker: 'week' },
  dateMonthRange: { format: 'YYYY-MM', picker: 'month' },
  dateQuarterRange: { format: 'YYYY-[Q]Q', picker: 'quarter' },
  dateYearRange: { format: 'YYYY', picker: 'year' },
  timeRange: { format: 'HH:mm:ss' },
}

export function createDateRangePicker(name: string, valueType: ProFormDateRangeValueType) {
  return defineProFormField(name, valueType, () => presets[valueType])
}

export const BaseDateRanger = createDateRangePicker('BaseDateRanger', 'dateRange')
