import type { RadioGroupProps } from 'antdv-next'
import type { FieldSelectProps } from '../Select'

export type GroupProps = {
  options?: RadioGroupProps['options']
  radioType?: 'button' | 'radio'
  placeholder?: string
  variant?: 'outlined' | 'borderless' | 'filled'
} & FieldSelectProps

export type FieldCascaderProps = GroupProps
