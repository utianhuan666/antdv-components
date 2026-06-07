import type { IntlType } from '../../../provider'
import type { ProFieldFC } from '../../types'
import { DateRangePicker } from 'antdv-next'
import { parseValueToDay } from '../../../utils'

type Props = NonNullable<
  ProFieldFC<{
    text: string[]
    format?: string
    variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
    showTime?: boolean | Record<string, any>
    picker?: 'time' | 'date' | 'week' | 'month' | 'quarter' | 'year'
  }>['__props']
> & {
  format: string
  intl: IntlType
}

export function FieldRangePickerEdit(props: Props) {
  const {
    text,
    mode,
    format,
    picker,
    formItemRender,
    showTime,
    intl,
    variant: propsVariant,
  } = props
  const fieldProps = props.fieldProps || {}
  const {
    placeholder: fieldPlaceholder,
    ...restFieldProps
  } = fieldProps
  const placeholder = Array.isArray(fieldPlaceholder)
    ? fieldPlaceholder
    : fieldPlaceholder
      ? [fieldPlaceholder, fieldPlaceholder]
      : [
          intl.getMessage('tableForm.selectPlaceholder', '请选择'),
          intl.getMessage('tableForm.selectPlaceholder', '请选择'),
        ]
  const parsedValue = parseValueToDay(fieldProps.value)
  const dayValue = Array.isArray(parsedValue) && parsedValue.length === 2
    ? [parsedValue[0], parsedValue[1]] as [any, any]
    : undefined
  const dom = (
    <DateRangePicker
      picker={picker}
      showTime={showTime}
      format={format}
      {...restFieldProps}
      placeholder={placeholder}
      variant={propsVariant ?? fieldProps?.variant}
      value={dayValue}
    />
  )
  if (formItemRender) {
    return formItemRender(text, { mode, ...fieldProps }, dom)
  }
  return dom
}

export default FieldRangePickerEdit
