import type { CSSProperties } from 'vue'
import type { ProFieldFC } from '../../types'
import { omit } from '@v-c/util'

type FieldTextAreaReadonlyProps = NonNullable<ProFieldFC<{
  text: string | number
}>['__props']>

export function FieldTextAreaReadonly(props: FieldTextAreaReadonlyProps) {
  const { text, fieldProps, emptyText = '-' } = props
  const restFieldProps = omit(fieldProps || {}, ['autoSize', 'classNames', 'styles'])
  return (
    <span
      {...restFieldProps}
      class={['ant-pro-field-readonly', 'ant-pro-field-readonly-textarea', restFieldProps.class]}
      style={{
        display: 'inline-block',
        lineHeight: '1.5715',
        maxWidth: '100%',
        whiteSpace: 'pre-wrap',
        ...(restFieldProps.style as CSSProperties),
      }}
    >
      {text ?? emptyText}
    </span>
  )
}

export default FieldTextAreaReadonly
