import type { VNodeChild } from 'vue'
import type { ProFieldFC } from '../../types'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldTextEdit from './FieldTextEdit'
import FieldTextRead from './FieldTextRead'

type FieldTextProps = NonNullable<ProFieldFC<{
  text: string | number | boolean | unknown[]
  emptyText?: VNodeChild
}>['__props']>

const FieldText: ProFieldFC<{
  text: string | number | boolean | unknown[]
  emptyText?: VNodeChild
}> = (props) => {
  const typedProps = props as FieldTextProps
  const text = typedProps.text ?? ''
  const mode = typedProps.mode ?? 'read'
  const emptyText = typedProps.emptyText ?? '-'

  if (isProFieldReadMode(mode)) {
    return FieldTextRead({
      text,
      mode,
      render: typedProps.render,
      fieldProps: typedProps.fieldProps,
      emptyText,
    })
  }

  if (isProFieldEditOrUpdateMode(mode)) {
    return FieldTextEdit({
      text,
      mode,
      formItemRender: typedProps.formItemRender,
      fieldProps: typedProps.fieldProps,
    })
  }

  return null
}

export default FieldText
