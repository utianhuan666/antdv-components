import type { ProFieldFC } from '../../types'
import { DateRangePicker } from 'antdv-next'
import { parseValueToDay } from '../DatePicker/datePickerUtils'

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
  intl: { getMessage: (id: string, defaultMessage: string) => string }
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
  const parsedValue = parseValueToDay(fieldProps.value, format)
  const dayValue = Array.isArray(parsedValue) && parsedValue.length === 2
    ? [parsedValue[0], parsedValue[1]] as [any, any]
    : undefined
  const dom = (
    <DateRangePicker
      picker={picker}
      showTime={showTime}
      format={format}
      placeholder={[
        intl.getMessage('tableForm.selectPlaceholder', '请选择'),
        intl.getMessage('tableForm.selectPlaceholder', '请选择'),
      ]}
      {...fieldProps}
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
