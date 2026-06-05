import type { ProFieldFC, ProFieldLightProps } from '../../types'
import { DatePicker } from 'antdv-next'
import FieldLabel from '../../../form/layouts/LightFilter/FieldLabel'
import { parseValueToDay } from './datePickerUtils'

type SetOpen = (open: boolean | ((open: boolean) => boolean)) => void

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
  open: boolean
  setOpen: SetOpen
  intl: { getMessage: (id: string, defaultMessage: string) => string }
}

export function FieldDatePickerLightEdit(props: Props) {
  const {
    text,
    mode,
    format,
    label,
    formItemRender,
    showTime,
    picker,
    variant,
    open,
    setOpen,
    intl,
  } = props
  const fieldProps = props.fieldProps || {}
  const { disabled, value } = fieldProps
  const dayValue = parseValueToDay(value, format)
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
        <DatePicker
          picker={picker}
          showTime={showTime}
          format={format}
          {...fieldProps}
          variant={variant ?? fieldProps?.variant}
          placeholder={fieldProps?.placeholder ?? intl.getMessage('tableForm.selectPlaceholder', '请选择')}
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
      style={dayValue ? { paddingInlineEnd: 0 } : undefined}
      onLabelClick={handleLabelClick}
    />
  )

  if (formItemRender)
    return formItemRender(text, { mode, ...fieldProps }, dom)
  return dom
}

export default FieldDatePickerLightEdit
