import type { ColProps, FormItemProps, RowProps } from 'antdv-next'
import type { CSSProperties, Ref, VNodeChild } from 'vue'
import type {
  ProFieldProps,
  ProFieldRequestData,
  ProFieldValueEnumType,
  ProFieldValueType,
  ProFormBaseGroupProps,
  ProSchema,
  SearchConvertKeyFn,
} from '../utils'
import type { ProFormInstance } from './BaseForm'
import type { ProFormItemProps } from './components'
import type { CaptFieldRef } from './components/Captcha'

export interface ProFormGridConfig {
  grid?: boolean
  colProps?: ColProps
  rowProps?: RowProps
}

export type ProFormItemCreateConfig = {
  valueType?: ProFieldValueType
  customLightMode?: boolean
  lightFilterLabelFormatter?: (value: any) => string
  defaultProps?: Record<string, any>
  ignoreWidth?: boolean
} & ProFormItemProps

export interface ExtendsProps {
  secondary?: boolean
  allowClear?: boolean
  bordered?: boolean
  colSize?: number
  params?: ((form: ProFormInstance) => Record<string, any>) | Record<string, any>
  ignoreFormItem?: boolean
  readonly?: boolean
  convertValue?: SearchConvertKeyFn
  formItemProps?: FormItemProps
  fieldConfig?: ProFormItemCreateConfig
  fieldRef?: Ref<CaptFieldRef | null | undefined>
}

export type ProFormGroupProps = ProFormBaseGroupProps & ProFormGridConfig

export interface FieldProps<K> {
  style?: CSSProperties
  width?: string
  ref?: Ref<K>
}

export type LightFilterFooterRender
  = | ((onConfirm?: (e?: MouseEvent) => void, onClear?: (e?: MouseEvent) => void) => VNodeChild | false)
    | false

export type ProFormFieldItemProps<T = Record<string, any>, K = any> = {
  fieldProps?: Partial<FieldProps<K> & T>
  text?: any
  value?: any
  defaultValue?: any
  initialValue?: any
  onChange?: (...args: any[]) => void
  placeholder?: string | string[]
  secondary?: boolean
  emptyText?: VNodeChild
  cacheForSwr?: boolean
  disabled?: boolean
  width?: number | 'sm' | 'md' | 'xl' | 'xs' | 'lg'
  proFieldProps?: ProFieldProps
  valueEnum?: ProFieldValueEnumType | ((...args: any[]) => ProFieldValueEnumType)
  request?: ProFieldRequestData
  params?: Record<string, any>
  mode?: 'edit' | 'read' | 'update'
  valuePropName?: string
  footerRender?: LightFilterFooterRender
  addonBefore?: VNodeChild
  addonAfter?: VNodeChild
  addonWarpStyle?: CSSProperties
  render?: (...args: any[]) => VNodeChild
  formItemRender?: (...args: any[]) => VNodeChild
  children?: any
  [key: string]: any
} & Omit<FormItemProps, 'valueType'>
& Pick<ProFormGridConfig, 'colProps'>
& ExtendsProps

export type ProFormFieldRemoteProps = Pick<
  ProSchema,
  'debounceTime' | 'request' | 'valueEnum' | 'params'
>

export { PRO_FIELD_SCHEMA_LAYOUT_VALUE_TYPES } from '../utils/typing'
export type {
  ProFieldBuiltinValueType,
  ProFieldSchemaLayoutValueType,
  ProFieldValueObjectType,
  ProFieldValueType,
  ProFieldValueTypeInput,
} from '../utils/typing'
