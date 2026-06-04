import type { ProFieldFC, ProFieldLightProps } from '../../types'
import { DateRangePicker } from 'antdv-next'
import FieldLabel from '../../../form/layouts/LightFilter/FieldLabel'
import { parseValueToDay } from '../DatePicker/datePickerUtils'

type SetOpen = (open: boolean | ((open: boolean) => boolean)) => void

type Props = NonNullable<
  ProFieldFC<
    {
      text: string[]
      format?: string
      variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
      showTime?: boolean | Record<string, any>
      picker?: 'time' | 'date' | 'week' | 'month' | 'quarter' | 'year'
    } & ProFieldLightProps
  >['__props']
> & {
  format: string
  open: boolean
  setOpen: SetOpen
  intl: { getMessage: (id: string, defaultMessage: string) => string }
}

export function FieldRangePickerLightEdit(props: Props) {
  const {
    text,
    mode,
    label,
    format,
    picker,
    formItemRender,
    showTime,
    variant: propsVariant,
    open,
    setOpen,
    intl,
  } = props
  const fieldProps = props.fieldProps || {}
  const parsedValue = parseValueToDay(fieldProps.value, format)
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
  const pickerDom = dayValue || open
    ? (
        <DateRangePicker
          picker={picker}
          showTime={showTime}
          format={format}
          {...fieldProps}
          placeholder={placeholder}
          variant={propsVariant ?? fieldProps?.variant}
          value={dayValue}
          onOpenChange={(nextOpen: boolean) => {
            setOpen(nextOpen)
            fieldProps?.onOpenChange?.(nextOpen)
          }}
          onChange={handleRangeChange}
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
      variant={propsVariant}
      style={dayValue ? { paddingInlineEnd: 0 } : undefined}
      onLabelClick={handleLabelClick}
    />
  )

  if (formItemRender)
    return formItemRender(text, { mode, ...fieldProps }, dom)
  return dom
}

export default FieldRangePickerLightEdit
