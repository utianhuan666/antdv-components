import type { Ref } from 'vue'
import type { ProFieldFC } from '../../types'
import type { FieldSecondProps } from './types'
import { formatSecond } from './utils'

type InputNumberInstance = InstanceType<typeof import('antdv-next')['InputNumber']>

export function FieldSecondRead(
  props: NonNullable<ProFieldFC<FieldSecondProps>['__props']>,
  ref?: Ref<InputNumberInstance | HTMLSpanElement | null>,
) {
  const { text, mode: type, render, fieldProps } = props
  const secondText = formatSecond(Number(text))
  const dom = <span ref={ref}>{secondText}</span>

  if (render)
    return render(text, { mode: type, ...fieldProps }, dom)

  return dom
}

export default FieldSecondRead
