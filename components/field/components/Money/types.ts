import type { InputNumberProps } from 'antdv-next'
import type { VNodeChild } from 'vue'

export interface FieldMoneyProps {
  text: number
  moneySymbol?: boolean
  locale?: string
  placeholder?: string
  customSymbol?: string
  numberPopoverRender?:
    | ((props: InputNumberProps, defaultText: string) => VNodeChild)
    | boolean
  numberFormatOptions?: Intl.NumberFormatOptions
}
