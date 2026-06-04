import type { ProFieldFC, ProFieldLightProps } from '../../types'
import { TimePicker } from 'antdv-next'
import FieldLabel from '../../../form/layouts/LightFilter/FieldLabel'
import { parseValueToDay } from '../DatePicker/datePickerUtils'

type SetOpen = (open: boolean | ((open: boolean) => boolean)) => void

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
  format: string
  open: boolean
  setOpen: SetOpen
  intl: { getMessage: (id: string, defaultMessage: string) => string }
}

export function FieldTimePickerLightEdit(props: Props) {
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
  const { disabled, value } = fieldProps
  const dayValue = parseValueToDay(value, finalFormat)
  const handleLabelClick = () => {
    if (disabled)
      return
    fieldProps?.onOpenChange?.(true)
    setOpen(true)
  }
  const pickerDom = dayValue || open
    ? (
        <TimePicker
          format={format}
          {...fieldProps}
          variant={variant ?? fieldProps?.variant}
          placeholder={fieldProps?.placeholder ?? intl.getMessage('tableForm.selectPlaceholder', '请选择')}
          value={dayValue}
          onOpenChange={(nextOpen: boolean) => {
            setOpen(nextOpen)
            fieldProps?.onOpenChange?.(nextOpen)
          }}
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
      variant={variant ?? fieldProps?.variant}
      style={dayValue ? { paddingInlineEnd: 0 } : undefined}
      onLabelClick={handleLabelClick}
    />
  )

  if (formItemRender)
    return formItemRender(text, { mode, ...fieldProps }, dom)
  return dom
}

export default FieldTimePickerLightEdit
