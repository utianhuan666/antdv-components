export type Value = string | number | undefined | null

export type ValuePair = Value[]

export interface FieldDigitRangeProps {
  text: ValuePair
  placeholder?: string | string[]
  separator?: string
  separatorWidth?: number
}
