import type { Ref } from 'vue'
import type { ProFieldFC } from '../../types'
import { omit } from '@v-c/util'
import { Switch } from 'antdv-next'
import FieldLabel from '../../../form/layouts/LightFilter/FieldLabel'

type Props = NonNullable<ProFieldFC<{
  text: boolean
  fieldProps?: Record<string, any>
  variant?: 'outlined' | 'borderless' | 'filled'
}>['__props']> & {
  variant: 'outlined' | 'borderless' | 'filled' | undefined
}

export function FieldSwitchLightEdit(props: Props, switchRef?: Ref<unknown> | null) {
  const { text, mode, label, formItemRender, fieldProps, variant } = props
  const editDom = (
    <Switch
      ref={switchRef as any}
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
