import type { ProFieldFC } from '../../types'
import type { FieldSecondProps } from './types'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldSecondEdit from './FieldSecondEdit'
import FieldSecondRead from './FieldSecondRead'
import { formatSecond } from './utils'

export { formatSecond }
export type { FieldSecondProps }
type FieldSecondFieldProps = NonNullable<ProFieldFC<FieldSecondProps>['__props']>

const FieldSecond: ProFieldFC<FieldSecondProps> = (props) => {
  const {
    text = 0,
    mode: type = 'read',
    render,
    placeholder,
    formItemRender,
    fieldProps = {},
  } = props as FieldSecondFieldProps

  const placeholderValue = placeholder || '请输入'

  if (isProFieldReadMode(type)) {
    return FieldSecondRead({
      text,
      mode: type,
      render,
      placeholder,
      formItemRender,
      fieldProps,
    })
  }

  if (isProFieldEditOrUpdateMode(type)) {
    return FieldSecondEdit({
      text,
      mode: type,
      render,
      placeholder,
      formItemRender,
      fieldProps,
      placeholderValue,
    })
  }

  return null
}

export default FieldSecond
