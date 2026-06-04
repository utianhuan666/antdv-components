import type { ProFieldFC } from '../../types'
import type { FieldImageProps } from './types'
import { Image } from 'antdv-next'

type Props = NonNullable<ProFieldFC<FieldImageProps>['__props']>

export function FieldImageRead(props: Props) {
  const { text, mode, render, fieldProps, width } = props
  const dom = (
    <Image
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
