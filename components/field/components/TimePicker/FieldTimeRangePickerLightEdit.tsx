import type { IntlType } from '../../../provider'
import type { ProFieldFC, ProFieldLightProps } from '../../types'
import { TimeRangePicker } from 'antdv-next'
import { FieldLabel, parseValueToDay } from '../../../utils'

type SetOpen = (open: boolean | ((open: boolean) => boolean)) => void

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

export function FieldTimeRangePickerLightEdit(props: Props) {
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
    ? [parsedValue[0], parsedValue[1]] as [any, any]
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
  const handleRangeChange = (nextValue: any) => {
    fieldProps?.onChange?.(nextValue)
    if (!nextValue)
      setOpen(false)
  }
  const handleBlur = (...args: any[]) => {
    setOpen(false)
    fieldProps?.onOpenChange?.(false)
    fieldProps?.onBlur?.(...args)
  }
  const pickerDom = dayValue || open
    ? (
        <TimeRangePicker
          format={format}
          {...fieldProps}
          variant={variant ?? fieldProps?.variant}
          placeholder={placeholder}
          value={dayValue}
          onOpenChange={(nextOpen: boolean) => {
            setOpen(nextOpen)
            fieldProps?.onOpenChange?.(nextOpen)
          }}
          onChange={handleRangeChange}
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
