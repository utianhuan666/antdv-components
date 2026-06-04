import type { ProFieldFC } from '../../types'
import { InputNumber } from 'antdv-next'

type Props = NonNullable<ProFieldFC<{
  text: number | string
  placeholder?: string
}>['__props']> & {
  placeholderValue: string
}

export function FieldProgressEdit(props: Props) {
  const { text, mode, formItemRender, fieldProps, placeholderValue } = props
  const dom = (
    <InputNumber
      {...({
        placeholder: placeholderValue,
        ...fieldProps,
      } as any)}
    />
  )

  if (formItemRender)
    return formItemRender(text, { mode, ...fieldProps }, dom)

  return dom
}

export default FieldProgressEdit
