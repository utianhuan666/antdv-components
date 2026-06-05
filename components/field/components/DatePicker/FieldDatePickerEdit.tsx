import type { ProFieldFC } from '../../types'
import type { IntlType } from '../../../provider'
import { DatePicker } from 'antdv-next'
import { parseValueToDay } from './datePickerUtils'

type Props = NonNullable<
  ProFieldFC<{
    text: string | number
    format?: string
    showTime?: boolean | Record<string, any>
    variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
    picker?: 'time' | 'date' | 'week' | 'month' | 'quarter' | 'year'
  }>['__props']
> & {
  format: string
  intl: IntlType
}

export function FieldDatePickerEdit(props: Props) {
  const {
    text,
    mode,
    format,
    formItemRender,
    showTime,
    picker,
    variant,
    intl,
  } = props
  const fieldProps = props.fieldProps || {}
  const {
    disabled: _disabled,
    value,
    placeholder = intl.getMessage('tableForm.selectPlaceholder', '请选择'),
  } = fieldProps
  const dayValue = parseValueToDay(value, format)

  const dom = (
    <DatePicker
      picker={picker}
      showTime={showTime}
      format={format}
      placeholder={placeholder}
      {...fieldProps}
      variant={variant ?? fieldProps?.variant}
      value={dayValue}
    />
  )
  if (formItemRender) {
    return formItemRender(text, { mode, ...fieldProps }, dom)
  }
  return dom
}

export default FieldDatePickerEdit
