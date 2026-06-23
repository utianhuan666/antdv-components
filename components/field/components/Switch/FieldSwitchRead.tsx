import type { VNodeChild } from 'vue'
import type { ProFieldFC } from '../../types'

type Props = NonNullable<ProFieldFC<{
  text: boolean
  variant?: 'outlined' | 'borderless' | 'filled'
}>['__props']> & {
  readLabel: VNodeChild
}

export function FieldSwitchRead(props: Props) {
  const { text, mode, render, fieldProps, readLabel } = props

  if (render)
    return render(text, { mode, ...fieldProps }, <>{readLabel}</>)

  return readLabel ?? '-'
}

export default FieldSwitchRead
