import type { VNodeChild } from 'vue'
import type { ProFieldFC } from '../../types'
import { Input } from 'antdv-next'

type FieldTextEditProps = NonNullable<ProFieldFC<{
  text: string | number | boolean | unknown[]
  emptyText?: VNodeChild
}>['__props']>

export function FieldTextEdit(props: FieldTextEditProps) {
  const { text, mode, formItemRender, fieldProps } = props
  const dom = (
    <Input
      placeholder="请输入"
      allowClear
      {...fieldProps}
    />
  )

  if (formItemRender)
    return formItemRender(text, { mode, ...fieldProps }, dom)

  return dom
}

export default FieldTextEdit
