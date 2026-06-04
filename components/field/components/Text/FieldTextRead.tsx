import type { VNodeChild } from 'vue'
import type { ProFieldFC } from '../../types'

type FieldTextReadProps = NonNullable<ProFieldFC<{
  text: string | number | boolean | unknown[]
  emptyText?: VNodeChild
}>['__props']> & {
  emptyText: VNodeChild
}

export function FieldTextRead(props: FieldTextReadProps) {
  const { text, mode, render, fieldProps, emptyText } = props
  const { prefix = '', suffix = '' } = fieldProps || {}
  const dom = (
    <>
      {prefix}
      {text ?? emptyText}
      {suffix}
    </>
  )

  if (render)
    return render(text, { mode, ...fieldProps }, dom) ?? emptyText

  return dom
}

export default FieldTextRead
