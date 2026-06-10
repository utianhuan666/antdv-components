import type { Ref } from 'vue'
import type { IntlType } from '../../../provider'
import type { ProFieldFC } from '../../types'
import { TextArea } from 'antdv-next'

type TextAreaInstance = InstanceType<typeof import('antdv-next')['TextArea']>

type Props = NonNullable<ProFieldFC<{ text: string | number }>['__props']> & {
  intl: IntlType
}

export function FieldTextAreaEdit(props: Props, ref?: Ref<TextAreaInstance | { $el?: HTMLElement | null } | null>) {
  const { text, mode, formItemRender, fieldProps, intl } = props
  const dom = (
    <TextArea
      ref={ref}
      rows={3}
      onKeydown={(event: KeyboardEvent) => {
        if (event.key === 'Enter')
          event.stopPropagation()
      }}
      placeholder={intl.getMessage('tableForm.inputPlaceholder', '请输入')}
      {...fieldProps}
    />
  )

  if (formItemRender)
    return formItemRender(text, { mode, ...fieldProps }, dom)

  return dom
}

export default FieldTextAreaEdit
