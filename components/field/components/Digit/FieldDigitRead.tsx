import type { Ref } from 'vue'
import type { ProFieldFC } from '../../types'
import type { FieldDigitProps } from './types'

type InputNumberInstance = InstanceType<typeof import('antdv-next')['InputNumber']>

export function FieldDigitRead(
  props: NonNullable<ProFieldFC<FieldDigitProps>['__props']>,
  ref?: Ref<InputNumberInstance | HTMLSpanElement | null>,
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
        <span ref={ref}>
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
