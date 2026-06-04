import type { ProFieldFC } from '../../types'
import type { FieldImageProps } from './types'
import { Input } from 'antdv-next'

type Props = NonNullable<ProFieldFC<FieldImageProps>['__props']> & {
  placeholderValue: string
}

export function FieldImageEdit(props: Props) {
  const { text, mode, formItemRender, fieldProps, placeholderValue } = props
  const dom = (
    <Input
      placeholder={placeholderValue}
      {...fieldProps}
    />
  )

  if (formItemRender)
    return formItemRender(text, { mode, ...fieldProps }, dom)

  return dom
}

export default FieldImageEdit
