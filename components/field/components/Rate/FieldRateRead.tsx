import type { Ref } from 'vue'
import type { ProFieldFC } from '../../types'
import { Rate } from 'antdv-next'

type Props = NonNullable<ProFieldFC<{ text: string }>['__props']>

export function FieldRateRead(props: Props, rateRef?: Ref<unknown> | null) {
  const { text, mode, render, fieldProps } = props
  const dom = (
    <Rate
      allowHalf
      disabled
      ref={rateRef as any}
      {...fieldProps}
      value={text as any}
    />
  )

  if (render)
    return render(text, { mode, ...fieldProps }, <>{dom}</>)

  return dom
}

export default FieldRateRead
