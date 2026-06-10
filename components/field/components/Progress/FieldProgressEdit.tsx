import type { Ref } from 'vue'
import type { ProFieldFC } from '../../types'
import { InputNumber } from 'antdv-next'

type InputNumberInstance = InstanceType<typeof import('antdv-next')['InputNumber']>
type ProgressInstance = InstanceType<typeof import('antdv-next')['Progress']>

type Props = Parameters<
  ProFieldFC<{
    text: number | string
    placeholder?: string
  }>
>[0] & {
  placeholderValue: string
}

export function FieldProgressEdit(props: Props, ref?: Ref<InputNumberInstance | ProgressInstance | null>) {
  const { text, mode, formItemRender, fieldProps, placeholderValue } = props
  const dom = (
    <InputNumber
      ref={ref}
      placeholder={placeholderValue}
      {...fieldProps}
    />
  )
  if (formItemRender) {
    return formItemRender(text, { mode, ...fieldProps }, dom)
  }
  return dom
}
