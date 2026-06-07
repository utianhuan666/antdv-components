import type { VNodeChild } from 'vue'
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

type ProFieldFCProps<T = {}>
  = Omit<BaseProFieldFC, 'text'> & { text?: BaseProFieldFC['text'] }
    & ProRenderFieldPropsType
    & T
    & Record<string, any>

export interface ProFieldFC<T = {}> {
  (props: ProFieldFCProps<T>): any
  __props?: ProFieldFCProps<T>
}

export interface ProFieldLightProps {
  lightLabel?: {
    labelRef: { value: HTMLElement | null }
    clearRef: { value: HTMLElement | null }
  }
  labelTrigger?: boolean
}

export type ProFieldValueTypeFunction<T> = (item: T) => ProFieldValueTypeInput

export type ProFieldRenderProps = Omit<ProFieldFCRenderProps, 'text' | 'placeholder'>
  & ProRenderFieldPropsType & {
    request?: ProFieldRequestData
    emptyText?: VNodeChild
    open?: boolean
    onOpenChange?: (open: boolean) => void
    [key: string]: any
  }

export type ProFieldPropsType = {
  text?: ProFieldTextType
  valueType?: ProFieldValueTypeInput
} & ProFieldRenderProps
