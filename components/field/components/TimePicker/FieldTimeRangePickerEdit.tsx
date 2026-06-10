import type { Ref } from 'vue'
import type { ProFieldFC } from '../../types'
import { TimeRangePicker } from 'antdv-next'
import { parseValueToDay } from '../../../utils'

type TimeRangePickerInstance = InstanceType<typeof import('antdv-next')['TimeRangePicker']>

type Props = NonNullable<
  ProFieldFC<{
    text: string[] | number[]
    format?: string
    variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
  }>['__props']
> & {
  finalFormat: string
  format: string
}

export function FieldTimeRangePickerEdit(props: Props, ref?: Ref<TimeRangePickerInstance | null>) {
  const {
    text,
    mode,
    format,
    formItemRender,
    variant,
    finalFormat,
  } = props
  const fieldProps = props.fieldProps || {}
  const parsedValue = parseValueToDay(fieldProps.value, finalFormat)
  const dayValue = Array.isArray(parsedValue) && parsedValue.length === 2
    ? [parsedValue[0], parsedValue[1]] as [typeof parsedValue[0], typeof parsedValue[1]]
    : undefined
  const dom = (
    <TimeRangePicker
      ref={ref}
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

export default FieldTimeRangePickerEdit
