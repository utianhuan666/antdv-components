import type { Ref } from 'vue'
import type { ProFieldFC } from '../../types'
import { Rate } from 'antdv-next'

type RateInstance = InstanceType<typeof import('antdv-next')['Rate']>

interface FieldRateProps { text: string }
type Props = NonNullable<ProFieldFC<FieldRateProps>['__props']>

export function FieldRateEdit(props: Props, rateRef?: Ref<RateInstance | null> | null) {
  const { text, mode, formItemRender, fieldProps } = props
  const dom = <Rate allowHalf ref={rateRef} {...fieldProps} />

  if (formItemRender)
    return formItemRender(text, { mode, ...fieldProps }, dom)

  return dom
}

export default FieldRateEdit
