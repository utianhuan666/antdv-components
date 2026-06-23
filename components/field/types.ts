import type { Ref, VNodeChild } from 'vue'
import type {
  BaseProFieldFC,
  ProFieldFCRenderProps,
  ProRenderFieldPropsType,
} from '../provider'
import type {
  ProFieldRequestData,
  ProFieldTextType,
  ProFieldValueTypeInput,
} from '../utils/typing'

export type ProFieldEmptyText = string | false

export type ProFieldFCProps<T = {}>
  = BaseProFieldFC
    & ProRenderFieldPropsType
    & T
    & Record<string, any>

export interface ProFieldFC<T = {}> {
  (props: ProFieldFCProps<T>): any
  __props?: ProFieldFCProps<T>
}

export interface ProFieldLightLabel {
  labelRef: Ref<HTMLElement | null>
  clearRef: Ref<HTMLElement | null>
}

export interface ProFieldLightProps {
  lightLabel?: ProFieldLightLabel
  labelTrigger?: boolean
}

export type ProFieldValueTypeFunction<T> = (item: T) => ProFieldValueTypeInput

export type ProFieldRenderProps = Omit<ProFieldFCRenderProps, 'text' | 'placeholder'>
  & ProRenderFieldPropsType & {
    request?: ProFieldRequestData
    params?: Record<string, unknown> | ((...args: any[]) => Record<string, unknown>)
    debounceTime?: number
    cacheForSwr?: boolean
    emptyText?: VNodeChild
    open?: boolean
    onOpenChange?: (open: boolean) => void
    [key: string]: any
  }

export type ProFieldPropsType = {
  text?: ProFieldTextType
  valueType?: ProFieldValueTypeInput
} & ProFieldRenderProps
