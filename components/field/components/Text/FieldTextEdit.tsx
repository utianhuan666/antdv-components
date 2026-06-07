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

  if (formItemRender)
    return formItemRender(text, { mode, ...fieldProps }, dom)

  return dom
}

export default FieldTextEdit
