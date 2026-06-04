import type { VNodeChild } from 'vue'
import type { ProFieldRequestData as BaseProFieldRequestData, ProFieldLightProps, ProRenderFieldPropsType, ProSchemaValueEnumMap, ProSchemaValueEnumObj } from '../../types'

export type ProFieldValueEnumType = ProSchemaValueEnumMap | ProSchemaValueEnumObj | Map<any, any> | Record<string, any> | undefined

export interface RequestOptionsType {
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

export interface FieldSelectProps<FieldProps = Record<string, any>> extends ProFieldLightProps, ProRenderFieldPropsType {
  text: any
  valueEnum?: ProFieldValueEnumType
  debounceTime?: number
  request?: ProFieldRequestData
  params?: any
  fieldProps?: FieldProps
  defaultKeyWords?: string
  variant?: 'outlined' | 'filled' | 'borderless' | 'underlined'
  id?: string
  style?: Record<string, any>
  className?: string
  fieldNames?: Record<string, string>
}
