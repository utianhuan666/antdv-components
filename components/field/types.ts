import type { InjectionKey, VNodeChild } from 'vue'
import type { ProFieldFCMode } from './internal/fieldMode'
import { inject } from 'vue'

// ---------------------------------------------------------------------------
// Empty text
// ---------------------------------------------------------------------------

/** Displayed when the field value is empty in read mode; `false` hides it. */
export type ProFieldEmptyText = string | false

export type BaseProFieldFC = ProFieldFCRenderProps

export type ProFieldFCProps<T = {}> = BaseProFieldFC & ProRenderFieldPropsType & T & Record<string, any>

/** Default Field component contract. */
export interface ProFieldFC<T = {}> {
  (props: ProFieldFCProps<T>): any
  __props?: ProFieldFCProps<T>
}

/** Light filter props injected by ProFieldLightWrapper. */
export interface ProFieldLightProps {
  lightLabel?: {
    labelRef: { value: HTMLElement | null }
    clearRef: { value: HTMLElement | null }
  }
  labelTrigger?: boolean
}

/** Value type by function. */
export type ProFieldValueTypeFunction<T> = (item: T) => ProFieldValueTypeInput

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

export const PRO_FIELD_SCHEMA_LAYOUT_VALUE_TYPES = [
  'group',
  'formList',
  'formSet',
  'divider',
  'dependency',
] as const

export type ProFieldSchemaLayoutValueType = typeof PRO_FIELD_SCHEMA_LAYOUT_VALUE_TYPES[number]

export type ProFieldBuiltinValueType = Exclude<ProFieldValueType, ProFieldSchemaLayoutValueType>

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
  variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
  lightLabel?: ProFieldLightProps['lightLabel']
  labelTrigger?: boolean
}

/** Customisers exposed by ProConfigProvider / valueTypeMap entries. */
export interface ProRenderFieldPropsType {
  render?: (
    text: any,
    props: Omit<ProFieldFCRenderProps, 'value' | 'onChange'>,
    dom: VNodeChild,
  ) => VNodeChild | undefined
  formItemRender?: (
    text: any,
    props: ProFieldFCRenderProps,
    dom: VNodeChild,
  ) => VNodeChild
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

// ---------------------------------------------------------------------------
// ProConfig provide / inject
// ---------------------------------------------------------------------------

export interface ProConfigContextType {
  valueTypeMap?: Record<string, ProRenderFieldPropsType>
}

export const ProConfigKey: InjectionKey<ProConfigContextType> = Symbol('ProConfig')

export const useProConfig = (): ProConfigContextType => inject(ProConfigKey, {})
