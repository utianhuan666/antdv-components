import type { CSSProperties, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { ProFieldRequestData as BaseProFieldRequestData, ProSchemaValueEnumMap, ProSchemaValueEnumObj } from '../../types'

export type ProFieldValueEnumType = ProSchemaValueEnumMap | ProSchemaValueEnumObj | Map<any, any> | Record<string, any> | undefined

export type RequestOptionsType = {
  label?: VNodeChild
  text?: VNodeChild
  value?: string | number | boolean
  optionType?: 'optGroup' | 'option'
  disabled?: boolean
  options?: RequestOptionsType[]
  children?: RequestOptionsType[]
  [key: string]: any
}

export type ProFieldRequestData = BaseProFieldRequestData<Record<string, any> & { keyWords?: string }>

export interface ProFieldLightProps {
  light?: boolean
  label?: VNodeChild
  lightLabel?: any
  labelTrigger?: boolean
}

export interface FieldSelectProps<FieldProps = Record<string, any>> extends ProFieldLightProps {
  text: any
  mode?: ProFieldFCMode
  valueEnum?: ProFieldValueEnumType
  debounceTime?: number
  request?: ProFieldRequestData
  params?: any
  fieldProps?: FieldProps
  render?: (text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined
  formItemRender?: (text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element
  emptyText?: VNodeChild
  proFieldKey?: string | number
  defaultKeyWords?: string
  cacheForSwr?: boolean
  variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
  id?: string
  style?: CSSProperties
  className?: string
}
