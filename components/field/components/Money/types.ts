import type { InputNumberProps } from 'antdv-next'

export interface FieldMoneyProps {
  text: number
  moneySymbol?: boolean
  locale?: string
  placeholder?: string
  customSymbol?: string
  numberPopoverRender?:
    | ((props: InputNumberProps, defaultText: string) => JSX.Element)
    | boolean
  numberFormatOptions?: Record<string, any>
}
