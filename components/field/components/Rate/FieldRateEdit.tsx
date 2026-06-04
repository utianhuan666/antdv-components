import type { Ref } from 'vue'
import type { ProFieldFC } from '../../types'
import { Rate } from 'antdv-next'

type Props = NonNullable<ProFieldFC<{ text: string }>['__props']>

export function FieldRateEdit(props: Props, rateRef?: Ref<unknown> | null) {
  const { text, mode, formItemRender, fieldProps } = props
  const dom = <Rate allowHalf ref={rateRef as any} {...fieldProps} />

  if (formItemRender)
    return formItemRender(text, { mode, ...fieldProps }, dom)

  return dom
}

export default FieldRateEdit
