import type { ProFieldFC } from '../../types'
import { TextArea } from 'antdv-next'

type Props = NonNullable<ProFieldFC<{ text: string | number }>['__props']>

export function FieldTextAreaEdit(props: Props) {
  const { text, mode, formItemRender, fieldProps } = props
  const dom = (
    <TextArea
      rows={3}
      onKeydown={(event: KeyboardEvent) => {
        if (event.key === 'Enter')
          event.stopPropagation()
      }}
      placeholder="请输入"
      {...fieldProps}
    />
  )

  if (formItemRender)
    return formItemRender(text, { mode, ...fieldProps }, dom)

  return dom
}

export default FieldTextAreaEdit
