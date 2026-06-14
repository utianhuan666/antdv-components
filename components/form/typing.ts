import type { ColProps, FormItemProps, RowProps, TooltipPlacement } from 'antdv-next'
import type { CSSProperties, Ref, VNodeChild } from 'vue'
import type {
  ProFieldProps,
  ProFormBaseGroupProps,
  ProSchema,
  SearchConvertKeyFn,
} from '../utils'
import type { ProFieldValueType } from '../utils/typing'
import type { ProFormInstance } from './BaseForm'
import type { ProFormItemProps } from './components/FormItem'
import type { FieldCascaderExpose, FieldSelectExpose } from '../field'

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
  params?:
    | ((form: ProFormInstance) => Record<string, any>)
    | Record<string, any>
  ignoreFormItem?: boolean
  readonly?: boolean
  convertValue?: SearchConvertKeyFn
  formItemProps?: FormItemProps
  fieldConfig?: ProFormItemCreateConfig
  fieldRef?: Ref<FieldSelectExpose | FieldCascaderExpose | null | undefined>
}

export type ProFormGroupProps = ProFormBaseGroupProps & ProFormGridConfig

export interface FieldProps<K> {
  style?: CSSProperties
  width?: string
  ref?: Ref<K>
}

export type LightFilterFooterRender
  = | ((
    onConfirm?: (e?: MouseEvent) => void,
    onClear?: (e?: MouseEvent) => void,
  ) => VNodeChild | false)
  | false

export type ProFormFieldItemProps<T = Record<string, any>, K = any> = {
  fieldProps?: Partial<FieldProps<K> & T>
  placeholder?: string | string[]
  secondary?: boolean
  emptyText?: VNodeChild
  cacheForSwr?: boolean
  disabled?: boolean
  width?: number | 'sm' | 'md' | 'xl' | 'xs' | 'lg'
  proFieldProps?: ProFieldProps
  footerRender?: LightFilterFooterRender
  children?: VNodeChild
} & Omit<ProFormItemProps, 'valueType'>
& Pick<ProFormGridConfig, 'colProps'>
& ExtendsProps

export type ProFormFieldVariant = 'outlined' | 'borderless' | 'filled' | 'underlined'

export type ProFormFieldRuntimeProps<T = Record<string, any>, K = any> = ProFormFieldItemProps<T, K> & {
  value?: any
  text?: any
  initialValue?: any
  defaultValue?: any
  onChange?: (...args: any[]) => void
  render?: (...args: any[]) => VNodeChild
  formItemRender?: (...args: any[]) => VNodeChild
  request?: ProSchema['request']
  valueEnum?: ProSchema['valueEnum']
  mode?: 'edit' | 'read' | 'update'
  valueType?: ProFieldValueType
  variant?: ProFormFieldVariant
  placement?: TooltipPlacement
  lightFilterLabelFormatter?: (value: any) => string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

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
