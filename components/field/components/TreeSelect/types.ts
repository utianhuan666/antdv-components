import type { TreeSelectProps } from 'antdv-next'
import type { CSSProperties } from 'vue'
import type { FieldSelectProps } from '../Select/types'

export type TreeSelectFieldProps = TreeSelectProps & {
  fetchDataOnSearch?: boolean
  style?: CSSProperties
  className?: string
  id?: string | number
}

export type FieldTreeSelectProps = FieldSelectProps<TreeSelectFieldProps>
