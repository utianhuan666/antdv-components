import type { Ref } from 'vue'
import type { ProFieldFC } from '../../types'
import type { FieldImageProps } from './types'
import { Image } from 'antdv-next'

type ImageInstance = InstanceType<typeof import('antdv-next')['Image']>

type Props = NonNullable<ProFieldFC<FieldImageProps>['__props']>

export function FieldImageRead(props: Props, ref?: Ref<ImageInstance | InstanceType<typeof import('antdv-next')['Input']> | null>) {
  const { text, mode, render, fieldProps, width } = props
  const dom = (
    <Image
      ref={ref}
      width={width || 32}
      src={text}
      {...fieldProps}
    />
  )

  if (render)
    return render(text, { mode, ...fieldProps }, dom)

  return dom
}

export default FieldImageRead
