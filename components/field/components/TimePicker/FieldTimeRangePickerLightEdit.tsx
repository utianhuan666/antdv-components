import type { Ref } from 'vue'
import type { IntlType } from '../../../provider'
import type { ProFieldFC, ProFieldLightProps } from '../../types'
import { TimeRangePicker } from 'antdv-next'
import { FieldLabel, parseValueToDay } from '../../../utils'

type SetOpen = (open: boolean | ((open: boolean) => boolean)) => void
type TimeRangePickerInstance = InstanceType<typeof import('antdv-next')['TimeRangePicker']>

type Props = NonNullable<
  ProFieldFC<
    {
      text: string[] | number[]
      format?: string
      variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
    } & ProFieldLightProps
  >['__props']
> & {
  finalFormat: string
  format: string
  open: boolean
  setOpen: SetOpen
  intl: IntlType
}

export function FieldTimeRangePickerLightEdit(props: Props, ref?: Ref<TimeRangePickerInstance | null>) {
  const {
    text,
    mode,
    label,
    format,
    formItemRender,
    variant,
    finalFormat,
    open,
    setOpen,
    intl,
  } = props
  const fieldProps = props.fieldProps || {}
  const parsedValue = parseValueToDay(fieldProps.value, finalFormat)
  const dayValue = Array.isArray(parsedValue) && parsedValue.length === 2
    ? [parsedValue[0], parsedValue[1]] as [typeof parsedValue[0], typeof parsedValue[1]]
    : undefined
  const {
    disabled,
    placeholder = [
      intl.getMessage('tableForm.selectPlaceholder', '请选择'),
      intl.getMessage('tableForm.selectPlaceholder', '请选择'),
    ],
  } = fieldProps
  const handleLabelClick = () => {
    if (disabled)
      return
    fieldProps?.onOpenChange?.(true)
    setOpen(true)
  }
  const handleBlur = (...args: any[]) => {
    setOpen(false)
    fieldProps?.onOpenChange?.(false)
    fieldProps?.onBlur?.(...args)
  }
  const pickerDom = dayValue || open
    ? (
        <TimeRangePicker
          ref={ref}
          format={format}
          {...fieldProps}
          variant={variant ?? fieldProps?.variant}
          placeholder={placeholder}
          value={dayValue}
          onOpenChange={(nextOpen: boolean) => {
            setOpen(nextOpen)
            fieldProps?.onOpenChange?.(nextOpen)
          }}
          onBlur={handleBlur}
          open={open}
        />
      )
    : undefined

  const dom = (
    <FieldLabel
      label={label}
      value={pickerDom}
      disabled={disabled}
      allowClear={false}
      downIcon={dayValue || open ? false : undefined}
      variant={variant}
      placeholder={placeholder}
      style={dayValue ? { paddingInlineEnd: 0 } : undefined}
      onClick={handleLabelClick}
    />
  )

  if (formItemRender)
    return formItemRender(text, { mode, ...fieldProps }, dom)
  return dom
}

export default FieldTimeRangePickerLightEdit
