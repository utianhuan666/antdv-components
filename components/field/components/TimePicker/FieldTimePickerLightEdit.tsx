import type { IntlType } from '../../../provider'
import type { ProFieldFC, ProFieldLightProps } from '../../types'
import { CloseCircleFilled } from '@antdv-next/icons'
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
  intl: IntlType
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
  const handleBlur = (...args: any[]) => {
    setOpen(false)
    fieldProps?.onOpenChange?.(false)
    fieldProps?.onBlur?.(...args)
  }
  const handleClear = (event: MouseEvent) => {
    event.stopPropagation()
    fieldProps?.onChange?.(undefined)
    setOpen(false)
  }
  const pickerDom = dayValue || open
    ? (
        <span style={{ position: 'relative', display: 'inline-flex' }}>
          <TimePicker
            format={format}
            {...fieldProps}
            allowClear={false}
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
          {dayValue
            ? (
                <CloseCircleFilled
                  class="ant-picker-clear"
                  onClick={handleClear}
                />
              )
            : null}
        </span>
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
