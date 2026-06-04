import type { InputNumberProps } from 'antdv-next'
import type { VNodeChild } from 'vue'

export type FieldMoneyProps = {
  text: number
  moneySymbol?: boolean
  locale?: string
  placeholder?: string
  customSymbol?: string
  numberPopoverRender?:
    | ((props: InputNumberProps, defaultText: string) => VNodeChild)
    | boolean
  numberFormatOptions?: {
    localeMatcher?: string
    style?: string
    currency?: string
    currencyDisplay?: string
    currencySign?: string
    useGrouping?: boolean
    minimumIntegerDigits?: number
    minimumFractionDigits?: number
    maximumFractionDigits?: number
    minimumSignificantDigits?: number
    maximumSignificantDigits?: number
  }
}
