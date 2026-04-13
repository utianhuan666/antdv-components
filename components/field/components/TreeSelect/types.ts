import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { ProFieldRequestData, ProFieldValueEnumType } from '../Select/types'

export interface FieldTreeSelectProps {
  text: string | number | (string | number)[]
  mode?: ProFieldFCMode
  /** Value enum: Map or Object mapping value -> label */
  valueEnum?: ProFieldValueEnumType
  /** Async function to fetch tree data */
  request?: ProFieldRequestData
  /** Params passed to request */
  params?: any
  /** Component-level props passed to antdv TreeSelect */
  fieldProps?: Record<string, any>
  /** Read mode render callback */
  render?: (text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined
  /** Edit mode render callback */
  formItemRender?: (text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element
  /** Text to display when value is empty */
  emptyText?: string
  /** When search keywords change, whether to request remote data */
  fetchDataOnSearch?: boolean
}
