import type { Ref } from 'vue'
import type { ProFieldFC } from '../../types'
import { Rate } from 'antdv-next'

type RateInstance = InstanceType<typeof import('antdv-next')['Rate']>

interface FieldRateProps { text: string }
type Props = NonNullable<ProFieldFC<FieldRateProps>['__props']>

export function FieldRateRead(props: Props, ref?: Ref<RateInstance | null>) {
  const { text, mode, render, fieldProps } = props
  const dom = (
    <Rate
      allowHalf
      disabled
      ref={ref}
      {...fieldProps}
      value={text}
    />
  )

  if (render)
    return render(text, { mode, ...fieldProps }, <>{dom}</>)

  return dom
}

export default FieldRateRead
