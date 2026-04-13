import type { VNodeChild } from 'vue'
import type { ProFieldFCMode } from './internal/fieldMode'

// ---------------------------------------------------------------------------
// Empty text
// ---------------------------------------------------------------------------

/** Displayed when the field value is empty in read mode; `false` hides it. */
export type ProFieldEmptyText = string | false

// ---------------------------------------------------------------------------
// Text / value types
// ---------------------------------------------------------------------------

/**
 * The "text" prop can hold almost anything:
 * a primitive, an array of primitives, a VNode, or a plain object.
 */
export type ProFieldTextType
  = | string
    | number
    | boolean
    | unknown[]
    | Record<string, any>
    | VNodeChild

// ---------------------------------------------------------------------------
// Value type enumeration
// ---------------------------------------------------------------------------

/** Built-in valueType strings (mirrors the React pro-components). */
export type ProFieldValueType
  = | 'text'
    | 'password'
    | 'money'
    | 'index'
    | 'indexBorder'
    | 'option'
    | 'textarea'
    | 'date'
    | 'dateWeek'
    | 'dateMonth'
    | 'dateQuarter'
    | 'dateYear'
    | 'dateTime'
    | 'fromNow'
    | 'dateRange'
    | 'dateTimeRange'
    | 'dateWeekRange'
    | 'dateMonthRange'
    | 'dateQuarterRange'
    | 'dateYearRange'
    | 'time'
    | 'timeRange'
    | 'select'
    | 'checkbox'
    | 'rate'
    | 'slider'
    | 'radio'
    | 'radioButton'
    | 'progress'
    | 'percent'
    | 'digit'
    | 'digitRange'
    | 'second'
    | 'code'
    | 'jsonCode'
    | 'avatar'
    | 'switch'
    | 'image'
    | 'cascader'
    | 'treeSelect'
    | 'color'
    | 'segmented'
    | 'group'
    | 'formList'
    | 'formSet'
    | 'divider'
    | 'dependency'

/** Object shorthand for certain valueTypes (progress / money / percent / image). */
export interface ProFieldValueObjectType {
  type: 'progress' | 'money' | 'percent' | 'image'
  status?: 'normal' | 'active' | 'success' | 'exception'
  locale?: string
  showSymbol?: ((value: any) => boolean) | boolean
  showColor?: boolean
  precision?: number
  moneySymbol?: boolean
  request?: ProFieldRequestData
  width?: number
}

/** valueType prop accepts either a string or an object shorthand. */
export type ProFieldValueTypeInput = ProFieldValueType | ProFieldValueObjectType

// ---------------------------------------------------------------------------
// ValueEnum types
// ---------------------------------------------------------------------------

export interface ProSchemaValueEnumType {
  text: VNodeChild
  status?: string
  color?: string
  disabled?: boolean
}

export type ProSchemaValueEnumMap = Map<
  string | number | boolean,
  ProSchemaValueEnumType | VNodeChild
>

export type ProSchemaValueEnumObj = Record<
  string,
  ProSchemaValueEnumType | VNodeChild
>

// ---------------------------------------------------------------------------
// Request data
// ---------------------------------------------------------------------------

export interface RequestOptionsType {
  label?: VNodeChild
  value?: string | number | boolean
  optionType?: 'optGroup' | 'option'
  options?: Omit<RequestOptionsType, 'optionType'>[]
  [key: string]: any
}

export type ProFieldRequestData<U = any> = (
  params: U,
  props: any,
) => Promise<RequestOptionsType[]>

// ---------------------------------------------------------------------------
// Render helper types
// ---------------------------------------------------------------------------

/** Props passed to the `render` / `formItemRender` callbacks. */
export interface ProFieldFCRenderProps {
  mode?: ProFieldFCMode
  readonly?: boolean
  placeholder?: string | string[]
  value?: any
  onChange?: (...args: any[]) => void
  text?: ProFieldTextType
  fieldProps?: any
  light?: boolean
  label?: VNodeChild
  valueEnum?: ProSchemaValueEnumObj | ProSchemaValueEnumMap
  proFieldKey?: string | number
}

/** Customisers exposed by ProConfigProvider / valueTypeMap entries. */
export interface ProRenderFieldPropsType {
  render?: (
    text: any,
    props: Omit<ProFieldFCRenderProps, 'value' | 'onChange'>,
    dom: JSX.Element,
  ) => JSX.Element | undefined
  formItemRender?: (
    text: any,
    props: ProFieldFCRenderProps,
    dom: JSX.Element,
  ) => JSX.Element
}

// ---------------------------------------------------------------------------
// Merged render props (passed into the per-field render function)
// ---------------------------------------------------------------------------

/** The merged props object passed to each Field render function. */
export type ProFieldRenderProps = Omit<ProFieldFCRenderProps, 'text' | 'placeholder'>
  & ProRenderFieldPropsType & {
    request?: ProFieldRequestData
    emptyText?: VNodeChild
    open?: boolean
    onOpenChange?: (open: boolean) => void
    [key: string]: any
  }

// ---------------------------------------------------------------------------
// Public ProField / PureProField props
// ---------------------------------------------------------------------------

/** The public props accepted by ProField and PureProField. */
export type ProFieldPropsType = {
  text?: ProFieldTextType
  valueType?: ProFieldValueTypeInput
} & ProFieldRenderProps
