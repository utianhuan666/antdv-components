import type { SwitchProps } from 'antdv-next'
import type { Ref } from 'vue'
import type { ProFieldFC } from '../../types'
import { omit } from '@v-c/util'
import { Switch } from 'antdv-next'
import { FieldLabel } from '../../../utils'

type SwitchInstance = InstanceType<typeof import('antdv-next')['Switch']>

type Props = NonNullable<ProFieldFC<{
  text: boolean
  fieldProps?: SwitchProps
  variant?: 'outlined' | 'borderless' | 'filled'
}>['__props']> & {
  variant: 'outlined' | 'borderless' | 'filled' | undefined
}

export function FieldSwitchLightEdit(props: Props, ref?: Ref<SwitchInstance | null>) {
  const { text, mode, label, formItemRender, fieldProps, variant } = props
  const editDom = (
    <Switch
      ref={ref}
      size="small"
      {...omit(fieldProps || {}, ['value'])}
      checked={fieldProps?.checked ?? fieldProps?.value}
    />
  )
  const dom = (
    <FieldLabel
      label={label}
      disabled={fieldProps?.disabled}
      variant={variant}
      downIcon={false}
      value={<div style={{ paddingInlineStart: '8px' }}>{editDom}</div>}
      allowClear={false}
    />
  )

  if (formItemRender)
    return formItemRender(text, { mode, ...fieldProps }, dom)

  return dom
}

export default FieldSwitchLightEdit
