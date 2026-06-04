import type { ProFieldFC } from '../../types'
import { InputPassword } from 'antdv-next'

type Props = NonNullable<ProFieldFC<{
  text: string | number
  open?: boolean
  onOpenChange?: (open: boolean) => void
}>['__props']>

export function FieldPasswordEdit(props: Props) {
  const { text, mode, formItemRender, fieldProps } = props
  const dom = (
    <InputPassword
      placeholder="请输入"
      {...fieldProps}
    />
  )

  if (formItemRender)
    return formItemRender(text, { mode, ...fieldProps }, dom)

  return dom
}

export default FieldPasswordEdit
