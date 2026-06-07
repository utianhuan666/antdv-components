import type { SwitchProps } from 'antdv-next'
import type { ProFieldFC } from '../../types'
import { useIntl } from '../../../provider'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldSwitchEdit from './FieldSwitchEdit'
import FieldSwitchLightEdit from './FieldSwitchLightEdit'
import FieldSwitchRead from './FieldSwitchRead'

interface FieldSwitchFCProps {
  text: boolean
  fieldProps?: SwitchProps & {
    variant?: 'outlined' | 'borderless' | 'filled'
  }
  variant?: 'outlined' | 'borderless' | 'filled'
}
type FieldSwitchProps = NonNullable<ProFieldFC<FieldSwitchFCProps>['__props']>

const FieldSwitch: ProFieldFC<FieldSwitchFCProps> = (props) => {
  const fieldProps = props as FieldSwitchProps
  const text = fieldProps.text
  const mode = props.mode ?? 'read'
  const switchProps = fieldProps.fieldProps ?? {}
  const variant = props.variant ?? switchProps.variant
  const intl = useIntl()
  const readLabel = text === undefined || text === null || `${text}`.length < 1
    ? '-'
    : text
      ? (switchProps.checkedChildren ?? intl.getMessage('switch.open', '打开'))
      : (switchProps.unCheckedChildren ?? intl.getMessage('switch.close', '关闭'))
  const mergedProps = {
    ...fieldProps,
    mode,
    fieldProps: switchProps,
  }

  if (isProFieldReadMode(mode)) {
    return FieldSwitchRead({
      ...mergedProps,
      readLabel,
    })
  }

  if (isProFieldEditOrUpdateMode(mode)) {
    const editProps = {
      ...mergedProps,
      variant,
    }

    if (props.light)
      return FieldSwitchLightEdit(editProps, null)

    return FieldSwitchEdit(editProps, null)
  }

  return null
}

export default FieldSwitch
