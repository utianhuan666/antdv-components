import type { VNodeChild } from 'vue'

export type PercentPropInt = {
  prefix?: VNodeChild
  suffix?: VNodeChild
  text?: number | string
  precision?: number
  showColor?: boolean
  showSymbol?: boolean | ((value: any) => boolean)
  placeholder?: string
}
