import type { Ref } from 'vue'
import type { ProFieldFC } from '../../types'
import type { FieldSecondProps } from './types'
import { InputNumber } from 'antdv-next'

type InputNumberInstance = InstanceType<typeof import('antdv-next')['InputNumber']>

type Props = NonNullable<ProFieldFC<FieldSecondProps>['__props']> & {
  placeholderValue: string
}

export function FieldSecondEdit(props: Props, secondRef?: Ref<InputNumberInstance | HTMLSpanElement | null> | null) {
  const { text, mode: type, formItemRender, fieldProps, placeholderValue } = props
  const dom = (
    <InputNumber
      ref={secondRef}
      min={0}
      style={{ width: '100%' }}
      placeholder={placeholderValue}
      {...fieldProps}
    />
  )

  if (formItemRender)
    return formItemRender(text, { mode: type, ...fieldProps }, dom)

  return dom
}

export default FieldSecondEdit
