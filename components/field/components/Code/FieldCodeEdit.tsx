import type { Ref } from 'vue'
import type { ProFieldFC } from '../../types'
import { TextArea } from 'antdv-next'

type TextAreaInstance = InstanceType<typeof import('antdv-next')['TextArea']>

type FieldCodeEditProps = NonNullable<ProFieldFC<{
  text: string
  language?: 'json' | 'text'
}>['__props']> & {
  code: string
}

export function FieldCodeEdit(props: FieldCodeEditProps, ref?: Ref<TextAreaInstance | HTMLPreElement | null>) {
  const { code, mode, formItemRender, fieldProps } = props
  const fp = { ...(fieldProps || {}), value: code }
  const dom = (
    <TextArea
      rows={5}
      {...fp}
      ref={ref}
    />
  )

  if (formItemRender)
    return formItemRender(code, { mode, ...fp, ref }, dom) ?? null

  return dom
}

export default FieldCodeEdit
