import type { CascaderProps } from 'antdv-next'
import type { FieldSelectProps } from '../Select/types'

export interface FieldCascaderProps extends FieldSelectProps<CascaderProps & Record<string, any>> {
  placeholder?: string
  variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
}

export type GroupProps = FieldCascaderProps
