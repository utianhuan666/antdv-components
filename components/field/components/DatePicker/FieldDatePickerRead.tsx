import type { ProFieldFC, ProFieldLightProps } from '../../types'
import { formatDate } from './datePickerUtils'

type Props = NonNullable<
  ProFieldFC<
    {
      text: string | number
      format?: string
      showTime?: boolean | Record<string, any>
      variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
      picker?: 'time' | 'date' | 'week' | 'month' | 'quarter' | 'year'
    } & ProFieldLightProps
  >['__props']
> & {
  format: string
}

export function FieldDatePickerRead(props: Props) {
  const { text, mode, render, format, picker } = props
  const fieldProps = props.fieldProps || {}
  const mergedPicker = (fieldProps?.picker as Props['picker'] | undefined) ?? picker
  const dom = <>{formatDate(text, fieldProps.format || format, mergedPicker)}</>
  if (render)
    return render(text, { mode, ...fieldProps }, dom)
  return dom
}

export default FieldDatePickerRead
