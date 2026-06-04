import type { ProFieldFC } from '../../types'
import { TextArea } from 'antdv-next'

type FieldCodeEditProps = NonNullable<ProFieldFC<{
  text: string
  language?: 'json' | 'text'
}>['__props']> & {
  code: string
}

export function FieldCodeEdit(props: FieldCodeEditProps) {
  const { code, mode, formItemRender, fieldProps } = props
  const fp = { ...(fieldProps || {}), value: code }
  const dom = (
    <TextArea
      rows={5}
      {...fp}
    />
  )

  if (formItemRender)
    return formItemRender(code, { mode, ...fp }, dom) ?? null

  return dom
}

export default FieldCodeEdit
