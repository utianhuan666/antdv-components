import type { Ref } from 'vue'
import type { ProFieldFC } from '../../types'
import { omit } from '@v-c/util'
import { Switch } from 'antdv-next'

type Props = NonNullable<ProFieldFC<{
  text: boolean
  fieldProps?: Record<string, any>
  variant?: 'outlined' | 'borderless' | 'filled'
}>['__props']> & {
  variant: 'outlined' | 'borderless' | 'filled' | undefined
}

export function FieldSwitchEdit(props: Props, switchRef?: Ref<unknown> | null) {
  const { text, mode, formItemRender, fieldProps } = props
  const editDom = (
    <Switch
      ref={switchRef as any}
      {...omit(fieldProps || {}, ['value'])}
      checked={fieldProps?.checked ?? fieldProps?.value}
    />
  )

  if (formItemRender)
    return formItemRender(text, { mode, ...fieldProps }, editDom)

  return editDom
}

export default FieldSwitchEdit
