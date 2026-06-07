import type { ProFieldFC } from '../../types'
import type { FieldDigitProps } from './types'
import { useIntl } from '../../../provider'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldDigitEdit from './FieldDigitEdit'
import FieldDigitRead from './FieldDigitRead'

export type { FieldDigitProps }
type FieldDigitFieldProps = NonNullable<ProFieldFC<FieldDigitProps>['__props']>

const FieldDigit: ProFieldFC<FieldDigitProps> = (props) => {
  const {
    text,
    mode: type = 'read',
    render,
    placeholder,
    formItemRender,
    fieldProps = {},
  } = props as FieldDigitFieldProps

  const intl = useIntl()
  const placeholderValue = placeholder || intl.getMessage('tableForm.inputPlaceholder', '请输入')

  if (isProFieldReadMode(type)) {
    return FieldDigitRead({
      text,
      mode: type,
      render,
      placeholder,
      formItemRender,
      fieldProps,
    })
  }

  if (isProFieldEditOrUpdateMode(type)) {
    return FieldDigitEdit({
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

export default FieldDigit
