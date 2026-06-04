import type { CheckboxGroupProps } from 'antdv-next'
import type { FieldSelectProps } from '../Select'

export type GroupProps = {
  layout?: 'horizontal' | 'vertical'
  options?: CheckboxGroupProps['options']
} & FieldSelectProps

export type FieldCheckboxProps = GroupProps
