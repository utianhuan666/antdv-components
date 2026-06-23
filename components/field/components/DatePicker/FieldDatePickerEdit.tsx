import type { Ref } from 'vue'
import type { IntlType } from '../../../provider'
import type { ProFieldFC } from '../../types'
import type { DatePickerProps } from 'antdv-next'
import { DatePicker } from 'antdv-next'
import { parseValueToDay } from '../../../utils'

type DatePickerInstance = InstanceType<typeof import('antdv-next')['DatePicker']>

type Props = NonNullable<
  ProFieldFC<{
    text: string | number
    format?: string
    showTime?: DatePickerProps['showTime']
    variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
    picker?: 'time' | 'date' | 'week' | 'month' | 'quarter' | 'year'
  }>['__props']
> & {
  format: string
  intl: IntlType
}

export function FieldDatePickerEdit(props: Props, ref?: Ref<DatePickerInstance | null>) {
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
  const dayValue = parseValueToDay(value)

  const dom = (
    <DatePicker
      picker={picker}
      showTime={showTime}
      format={format}
      placeholder={placeholder}
      ref={ref}
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
