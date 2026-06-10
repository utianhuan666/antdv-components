import type { Ref, VNodeChild } from 'vue'
import type { IntlType } from '../../../provider'
import type { ProFieldFC } from '../../types'
import { Input } from 'antdv-next'

type InputInstance = InstanceType<typeof import('antdv-next')['Input']>

type FieldTextEditProps = NonNullable<ProFieldFC<{
  text: string | number | boolean | unknown[]
  emptyText?: VNodeChild
}>['__props']> & {
  intl: IntlType
}

export function FieldTextEdit(props: FieldTextEditProps, ref?: Ref<InputInstance | null>) {
  const { text, mode, formItemRender, fieldProps, intl } = props
  const placeholder = intl.getMessage('tableForm.inputPlaceholder', '请输入')

  const dom = (
    <Input
      ref={ref}
      placeholder={placeholder}
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
