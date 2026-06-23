import type { ProFieldFC } from '../../types'

type Props = NonNullable<ProFieldFC<{ text: string }>['__props']>

export function FieldSliderRead(props: Props) {
  const { text, mode, render, fieldProps } = props
  const dom = text

  if (render)
    return render(text, { mode, ...fieldProps }, <>{dom}</>)

  return <>{dom}</>
}

export default FieldSliderRead
