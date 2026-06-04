import type { ProFieldFC } from '../../types'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import { toNumber } from '../Percent/util'
import FieldProgressEdit from './FieldProgressEdit'
import FieldProgressRead from './FieldProgressRead'
import { getProgressStatus } from './utils'

export { getProgressStatus }
type FieldProgressProps = NonNullable<ProFieldFC<{
  text: number | string
  placeholder?: string
}>['__props']>

const FieldProgress: ProFieldFC<{
  text: number | string
  placeholder?: string
}> = (props) => {
  const {
    text = 0,
    mode = 'read',
    render,
    formItemRender,
    fieldProps = {},
    placeholder,
  } = props as FieldProgressProps

  const realValue = typeof text === 'string' && text.includes('%')
    ? toNumber(text.replace('%', ''))
    : toNumber(text)

  const placeholderValue = placeholder || '请输入'

  if (isProFieldReadMode(mode)) {
    return FieldProgressRead({
      text,
      mode,
      render,
      formItemRender,
      fieldProps,
      placeholder,
      realValue,
    })
  }

  if (isProFieldEditOrUpdateMode(mode)) {
    return FieldProgressEdit({
      text,
      mode,
      render,
      formItemRender,
      fieldProps,
      placeholder,
      placeholderValue,
    })
  }

  return null
}

export default FieldProgress
