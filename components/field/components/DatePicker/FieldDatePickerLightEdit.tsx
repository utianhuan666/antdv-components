import type { ComponentPublicInstance, Ref } from 'vue'
import type { IntlType } from '../../../provider'
import type { ProFieldFC, ProFieldLightProps } from '../../types'
import type { DatePickerProps } from 'antdv-next'
import { DatePicker } from 'antdv-next'
import { FieldLabel, parseValueToDay } from '../../../utils'

type SetOpen = (open: boolean | ((open: boolean) => boolean)) => void
type DatePickerInstance = InstanceType<typeof import('antdv-next')['DatePicker']>

type FieldLabelExposed = {
  labelRef?: Ref<HTMLElement | null>
  clearRef?: Ref<HTMLElement | null>
}

type Props = NonNullable<
  ProFieldFC<
    {
      text: string | number
      format?: string
      showTime?: DatePickerProps['showTime']
      variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
      picker?: 'time' | 'date' | 'week' | 'month' | 'quarter' | 'year'
    } & ProFieldLightProps
  >['__props']
> & {
  format: string
  open: boolean
  setOpen: SetOpen
  intl: IntlType
}

export function FieldDatePickerLightEdit(props: Props, ref?: Ref<DatePickerInstance | null>) {
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
    lightLabel,
  } = props
  const fieldProps = props.fieldProps || {}
  const { disabled, value } = fieldProps
  const dayValue = parseValueToDay(value)
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
  const syncLightLabelRef = (instance: Element | ComponentPublicInstance | null) => {
    if (!lightLabel || !instance || typeof instance !== 'object')
      return

    const exposed = instance as ComponentPublicInstance & FieldLabelExposed
    lightLabel.labelRef.value = exposed.labelRef?.value ?? null
    lightLabel.clearRef.value = exposed.clearRef?.value ?? null
  }

  const pickerDom = dayValue || open
    ? (
        <DatePicker
          picker={picker}
          showTime={showTime}
          format={format}
          ref={ref}
          {...fieldProps}
          variant={variant ?? fieldProps?.variant}
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
      onClick={handleLabelClick}
      ref={syncLightLabelRef}
    />
  )

  if (formItemRender)
    return formItemRender(text, { mode, ...fieldProps }, dom)
  return dom
}

export default FieldDatePickerLightEdit
