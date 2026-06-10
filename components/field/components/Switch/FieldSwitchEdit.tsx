import type { SwitchProps } from 'antdv-next'
import type { Ref } from 'vue'
import type { ProFieldFC } from '../../types'
import { omit } from '@v-c/util'
import { Switch } from 'antdv-next'

type SwitchInstance = InstanceType<typeof import('antdv-next')['Switch']>

type Props = NonNullable<ProFieldFC<{
  text: boolean
  fieldProps?: SwitchProps
  variant?: 'outlined' | 'borderless' | 'filled'
}>['__props']> & {
  variant: 'outlined' | 'borderless' | 'filled' | undefined
}

export function FieldSwitchEdit(props: Props, ref?: Ref<SwitchInstance | null>) {
  const { text, mode, formItemRender, fieldProps } = props
  const editDom = (
    <Switch
      ref={ref}
      {...omit(fieldProps || {}, ['value'])}
      checked={fieldProps?.checked ?? fieldProps?.value}
    />
  )

  if (formItemRender)
    return formItemRender(text, { mode, ...fieldProps }, editDom)

  return editDom
}

export default FieldSwitchEdit
