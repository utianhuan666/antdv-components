import type { ProFieldFC } from '../../types'
import type { FieldSecondProps } from './types'
import { formatSecond } from './utils'

export function FieldSecondRead(
  props: NonNullable<ProFieldFC<FieldSecondProps>['__props']>,
) {
  const { text, mode: type, render, fieldProps } = props
  const secondText = formatSecond(Number(text))
  const dom = <span>{secondText}</span>

  if (render)
    return render(text, { mode: type, ...fieldProps }, dom)

  return dom
}

export default FieldSecondRead
