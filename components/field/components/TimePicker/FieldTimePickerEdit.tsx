import type { ProFieldFC } from '../../types'
import { TimePicker } from 'antdv-next'
import { parseValueToDay } from '../../../utils'

type Props = NonNullable<
  ProFieldFC<{
    text: string | number
    format?: string
    variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
  }>['__props']
> & {
  finalFormat: string
  format: string
}

export function FieldTimePickerEdit(props: Props) {
  const {
    text,
    mode,
    format,
    formItemRender,
    finalFormat,
    variant,
  } = props
  const fieldProps = props.fieldProps || {}
  const dayValue = parseValueToDay(fieldProps.value, finalFormat)

  const dom = (
    <TimePicker
      format={format}
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

export default FieldTimePickerEdit
