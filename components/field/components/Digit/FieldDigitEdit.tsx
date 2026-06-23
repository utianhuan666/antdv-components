import type { Ref } from 'vue'
import type { ProFieldFC } from '../../types'
import type { FieldDigitProps } from './types'
import { InputNumber } from 'antdv-next'

type InputNumberInstance = InstanceType<typeof import('antdv-next')['InputNumber']>

type Props = NonNullable<ProFieldFC<FieldDigitProps>['__props']> & {
  placeholderValue: string
}

export function FieldDigitEdit(props: Props, ref?: Ref<InputNumberInstance | HTMLSpanElement | null>) {
  const { text, mode: type, formItemRender, fieldProps, placeholderValue } = props
  const dom = (
    <InputNumber
      ref={ref}
      {...({
        min: 0,
        placeholder: placeholderValue,
        ...fieldProps,
      } as any)}
    />
  )

  if (formItemRender)
    return formItemRender(text, { mode: type, ...fieldProps }, dom)

  return dom
}

export default FieldDigitEdit
