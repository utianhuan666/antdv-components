import type { TreeSelectProps } from 'antdv-next'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { FieldSelectProps } from '../Select/types'

export type TreeSelectFieldProps = TreeSelectProps & Record<string, any> & {
  fetchDataOnSearch?: boolean
}

export interface FieldTreeSelectProps extends FieldSelectProps<TreeSelectFieldProps> {
  text: any
  mode?: ProFieldFCMode
  fieldProps?: TreeSelectFieldProps
  fetchDataOnSearch?: boolean
}
