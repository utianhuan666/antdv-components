import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { ProFieldValueEnumType } from '../Select/types'

export interface FieldCheckboxProps {
  text: string | number | (string | number)[]
  mode?: ProFieldFCMode
  /** Value enum: Map or Object mapping value -> label */
  valueEnum?: ProFieldValueEnumType
  /** Checkbox group options */
  options?: Array<{ label: string, value: string | number, disabled?: boolean }>
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
