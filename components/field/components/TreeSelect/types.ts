import type { TreeSelectProps } from 'antdv-next'
import type { FieldSelectProps } from '../Select/types'

export type TreeSelectFieldProps = TreeSelectProps & Record<string, any> & {
  fetchDataOnSearch?: boolean
}

export type FieldTreeSelectProps = FieldSelectProps<TreeSelectFieldProps>
