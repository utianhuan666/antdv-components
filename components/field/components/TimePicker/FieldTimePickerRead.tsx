import type { ProFieldFC, ProFieldLightProps } from '../../types'
import { parseValueToDay } from '../DatePicker/datePickerUtils'

type Props = NonNullable<
  ProFieldFC<
    {
      text: string | number
      format?: string
      variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
    } & ProFieldLightProps
  >['__props']
> & {
  finalFormat: string
}

export function FieldTimePickerRead(props: Props) {
  const { text, mode, render, finalFormat } = props
  const fieldProps = props.fieldProps || {}
  const dayValue = parseValueToDay(text, finalFormat)
  const formatted = dayValue && !Array.isArray(dayValue)
    ? dayValue.format(finalFormat)
    : '-'
  const dom = <span>{formatted}</span>
  if (render)
    return render(text, { mode, ...fieldProps }, <span>{dom}</span>)
  return dom
}

export default FieldTimePickerRead
