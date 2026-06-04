import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { ProFieldRequestData, ProFieldValueEnumType } from '../Select/types'

export interface FieldCheckboxProps {
  text: string | number | (string | number)[]
  mode?: ProFieldFCMode
  /** Value enum: Map or Object mapping value -> label */
  valueEnum?: ProFieldValueEnumType
  /** Checkbox group options */
  options?: Array<{ label: any, value: any, disabled?: boolean }>
  /** Async function to fetch options */
  request?: ProFieldRequestData
  /** Params passed to request */
  params?: any
  /** Debounce time in ms for request */
  debounceTime?: number
  /** Layout direction for checkbox group */
  layout?: 'horizontal' | 'vertical'
  /** Component-level props passed to antdv CheckboxGroup */
  fieldProps?: Record<string, any>
  /** Read mode render callback */
  render?: (text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined
  /** Edit mode render callback */
  formItemRender?: (text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element
  /** Text to display when value is empty */
  emptyText?: string
}
