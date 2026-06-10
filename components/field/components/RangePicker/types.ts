import type { RangePickerProps } from 'antdv-next'
import type { ProFieldLightProps } from '../../types'

export interface RangePickerSharedProps {
  text: string[]
  format?: string
  variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
  showTime?: boolean
  picker?: 'time' | 'date' | 'week' | 'month' | 'quarter' | 'year'
}

export type FieldRangePickerProps = RangePickerSharedProps & ProFieldLightProps & {
  fieldProps?: RangePickerProps & {
    format?: RangePickerProps['format']
    picker?: RangePickerProps['picker']
  }
}
