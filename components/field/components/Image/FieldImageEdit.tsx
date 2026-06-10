import type { Ref } from 'vue'
import type { ProFieldFC } from '../../types'
import type { FieldImageProps } from './types'
import { Input } from 'antdv-next'

type InputInstance = InstanceType<typeof import('antdv-next')['Input']>

type Props = NonNullable<ProFieldFC<FieldImageProps>['__props']> & {
  placeholderValue: string
}

export function FieldImageEdit(props: Props, ref?: Ref<InputInstance | InstanceType<typeof import('antdv-next')['Image']> | null>) {
  const { text, mode, formItemRender, fieldProps, placeholderValue } = props
  const dom = (
    <Input
      ref={ref}
      placeholder={placeholderValue}
      {...fieldProps}
    />
  )

  if (formItemRender)
    return formItemRender(text, { mode, ...fieldProps }, dom)

  return dom
}

export default FieldImageEdit
