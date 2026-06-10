import type { Ref } from 'vue'
import type { IntlType } from '../../../provider'
import type { ProFieldFC } from '../../types'
import { InputPassword } from 'antdv-next'

type InputPasswordInstance = InstanceType<typeof import('antdv-next')['InputPassword']>

type Props = NonNullable<ProFieldFC<{
  text: string | number
  open?: boolean
  onOpenChange?: (open: boolean) => void
}>['__props']> & {
  intl: IntlType
}

export function FieldPasswordEdit(props: Props, ref?: Ref<InputPasswordInstance | HTMLSpanElement | null>) {
  const { text, mode, formItemRender, fieldProps, intl } = props
  const dom = (
    <InputPassword
      placeholder={intl.getMessage('tableForm.inputPlaceholder', '请输入')}
      ref={ref}
      {...fieldProps}
    />
  )

  if (formItemRender)
    return formItemRender(text, { mode, ...fieldProps }, dom)

  return dom
}

export default FieldPasswordEdit
