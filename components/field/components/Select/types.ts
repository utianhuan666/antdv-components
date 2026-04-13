import type { VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'

/**
 * Value enum type: Map or plain object mapping value -> label or { text, status, color, disabled }
 */
export type ProFieldValueEnumType = Map<any, any> | Record<string, any> | undefined

/**
 * Request function type for async option loading
 */
export type ProFieldRequestData = (
  params: Record<string, any> & { keyWords?: string },
  props: Record<string, any>,
) => Promise<any[]>

export interface FieldSelectProps {
  text: string | number | (string | number)[]
  mode?: ProFieldFCMode
  /** Value enum: Map or Object mapping value -> label */
  valueEnum?: ProFieldValueEnumType
  /** Debounce time in ms for request */
  debounceTime?: number
  /** Async function to fetch options */
  request?: ProFieldRequestData
  /** Params passed to request */
  params?: any
  /** Component-level props passed to antdv Select */
  fieldProps?: Record<string, any>
  /** Read mode render callback */
  render?: (text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined
  /** Edit mode render callback */
  formItemRender?: (text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element
  /** Text to display when value is empty */
  emptyText?: VNodeChild
  /** Default search keywords */
  defaultKeyWords?: string
}
