import type { Ref, VNodeChild } from 'vue'
import type { IntlType } from '../../../provider'
import type { ProFieldFC } from '../../types'
import { Input } from 'antdv-next'

type FieldTextEditProps = NonNullable<ProFieldFC<{
  text: string | number | boolean | unknown[]
  emptyText?: VNodeChild
}>['__props']> & {
  inputRef: Ref<any>
  intl: IntlType
}

export function FieldTextEdit(props: FieldTextEditProps) {
  const { text, mode, formItemRender, fieldProps, inputRef, intl } = props

  const dom = (
    <Input
      ref={inputRef}
      placeholder={intl.getMessage('tableForm.inputPlaceholder', '请输入')}
      allowClear
      {...fieldProps}
    />
  )

  // If an id is specified, wrap in a span with the id since antdv-next Input doesn't forward id prop
  const finalDom = fieldProps?.id
    ? (
        <span id={fieldProps.id} style={{ display: 'contents' }}>
          {dom}
        </span>
      )
    : dom

  if (formItemRender)
    return formItemRender(text, { mode, ...fieldProps }, finalDom)

  return finalDom
}

export default FieldTextEdit
