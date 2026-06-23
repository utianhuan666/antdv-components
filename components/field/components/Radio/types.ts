import type { RadioGroupProps } from 'antdv-next'
import type { FieldSelectProps } from '../Select'

export type GroupProps = {
  options?: RadioGroupProps['options']
  radioType?: RadioGroupProps['optionType']
} & FieldSelectProps
