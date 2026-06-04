import type { ProFieldFC } from '../../types'
import type { FieldSecondProps } from './types'
import { InputNumber } from 'antdv-next'

type Props = NonNullable<ProFieldFC<FieldSecondProps>['__props']> & {
  placeholderValue: string
}

export function FieldSecondEdit(props: Props) {
  const { text, mode: type, formItemRender, fieldProps, placeholderValue } = props
  const dom = (
    <InputNumber
      {...({
        min: 0,
        style: { width: '100%' },
        placeholder: placeholderValue,
        ...fieldProps,
      } as any)}
    />
  )

  if (formItemRender)
    return formItemRender(text, { mode: type, ...fieldProps }, dom)

  return dom
}

export default FieldSecondEdit
