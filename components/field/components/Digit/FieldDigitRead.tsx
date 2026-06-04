import type { ProFieldFC } from '../../types'
import type { FieldDigitProps } from './types'

export function FieldDigitRead(
  props: NonNullable<ProFieldFC<FieldDigitProps>['__props']>,
) {
  const { text, mode: type, render, fieldProps } = props
  let fractionDigits: Intl.NumberFormatOptions = {}
  if (fieldProps?.precision) {
    fractionDigits = {
      minimumFractionDigits: Number(fieldProps.precision),
      maximumFractionDigits: Number(fieldProps.precision),
    }
  }

  const digit = new Intl.NumberFormat(undefined, {
    ...fractionDigits,
    ...(fieldProps?.intlProps || {}),
  }).format(Number(text))

  const dom = !fieldProps?.stringMode
    ? (
        <span>
          {fieldProps?.formatter?.(digit) || digit}
        </span>
      )
    : (
        <span>{text}</span>
      )

  if (render)
    return render(text, { mode: type, ...fieldProps }, dom)

  return dom
}

export default FieldDigitRead
