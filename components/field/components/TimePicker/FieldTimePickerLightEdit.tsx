import type { ComponentPublicInstance, Ref } from 'vue'
import type { IntlType } from '../../../provider'
import type { ProFieldFC, ProFieldLightProps } from '../../types'
import { TimePicker } from 'antdv-next'
import { FieldLabel, parseValueToDay } from '../../../utils'

type SetOpen = (open: boolean | ((open: boolean) => boolean)) => void
type TimePickerInstance = InstanceType<typeof import('antdv-next')['TimePicker']>

interface FieldLabelExposed {
  labelRef?: Ref<HTMLElement | null>
  clearRef?: Ref<HTMLElement | null>
}

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

export function FieldTimePickerLightEdit(props: Props, ref?: Ref<TimePickerInstance | null> | null) {
  const {
    text,
    mode,
    label,
    format,
    formItemRender,
    lightLabel,
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

  const syncLightLabelRef = (instance: Element | ComponentPublicInstance | null) => {
    if (!lightLabel || !instance || typeof instance !== 'object')
      return

    const exposed = instance as ComponentPublicInstance & FieldLabelExposed
    lightLabel.labelRef.value = exposed.labelRef?.value ?? null
    lightLabel.clearRef.value = exposed.clearRef?.value ?? null
  }

  const pickerDom = dayValue || open
    ? (
        <TimePicker
          format={format}
          ref={ref}
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
      variant={variant ?? fieldProps?.variant}
      style={dayValue ? { paddingInlineEnd: 0 } : undefined}
      onClick={handleLabelClick}
      ref={syncLightLabelRef}
    />
  )

  if (formItemRender)
    return formItemRender(text, { mode, ...fieldProps }, dom)
  return dom
}

export default FieldTimePickerLightEdit
