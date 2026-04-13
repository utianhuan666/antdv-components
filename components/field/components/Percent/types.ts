import type { VNode } from 'vue'

export interface PercentPropInt {
  prefix?: VNode
  suffix?: VNode
  text?: number | string
  precision?: number
  showColor?: boolean
  showSymbol?: boolean | ((value: any) => boolean)
  placeholder?: string
}
