import type { ProRenderFieldPropsType } from '../../../provider'
import type {
  ProFieldTextType,
  ProFieldRequestData,
  ProFieldValueEnumType,
  RequestOptionsType as BaseRequestOptionsType,
} from '../../../utils/typing'
import type { ProFieldLightProps } from '../../types'

export type {
  ProFieldRequestData,
  ProFieldValueEnumType,
}

export interface RequestOptionsType extends BaseRequestOptionsType {
  text?: BaseRequestOptionsType['label']
  disabled?: boolean
  className?: string
  key?: string | number | boolean
  title?: BaseRequestOptionsType['label']
  data_title?: BaseRequestOptionsType['label']
  options?: RequestOptionsType[]
  children?: RequestOptionsType[]
}

export interface FieldSelectProps<FieldProps = Record<string, unknown>> extends ProFieldLightProps, ProRenderFieldPropsType {
  text: ProFieldTextType
  valueEnum?: ProFieldValueEnumType
  debounceTime?: number
  request?: ProFieldRequestData
  params?: Record<string, unknown>
  options?: RequestOptionsType[]
  fieldProps?: FieldProps
  defaultKeyWords?: string
  variant?: 'outlined' | 'filled' | 'borderless' | 'underlined'
  id?: string
}
