import type { ComponentPublicInstance, Ref } from 'vue'
import type { IntlType } from '../../../provider'
import type { ProFieldFC } from '../../types'
import type { FieldRangePickerProps } from './types'
import { DateRangePicker } from 'antdv-next'
import { FieldLabel, parseValueToDay } from '../../../utils'

type SetOpen = (open: boolean | ((open: boolean) => boolean)) => void
type DateRangePickerInstance = InstanceType<typeof import('antdv-next')['DateRangePicker']>

interface FieldLabelExposed {
  labelRef?: Ref<HTMLElement | null>
  clearRef?: Ref<HTMLElement | null>
}

type Props = NonNullable<ProFieldFC<FieldRangePickerProps>['__props']> & {
  format: string
  open: boolean
  setOpen: SetOpen
  intl: IntlType
}

export function FieldRangePickerLightEdit(props: Props, ref?: Ref<DateRangePickerInstance | null>) {
  const {
    text,
    mode,
    label,
    format,
    picker,
    formItemRender,
    showTime,
    lightLabel,
    variant: propsVariant,
    open,
    setOpen,
    intl,
  } = props

  const fieldProps = props.fieldProps || {}
  const dayValue = parseValueToDay(fieldProps.value) as any

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
  const syncLightLabelRef = (instance: Element | ComponentPublicInstance | null) => {
    if (!lightLabel || !instance || typeof instance !== 'object')
      return

    const exposed = instance as ComponentPublicInstance & FieldLabelExposed
    lightLabel.labelRef.value = exposed.labelRef?.value ?? null
    lightLabel.clearRef.value = exposed.clearRef?.value ?? null
  }

  const handleLabelClick = () => {
    if (fieldProps.disabled)
      return
    fieldProps?.onOpenChange?.(true)
    setOpen(true)
  }

  const dom = (
    <FieldLabel
      label={label}
      onClick={handleLabelClick}
      style={
        dayValue
          ? {
              paddingInlineEnd: 0,
            }
          : undefined
      }
      disabled={fieldProps.disabled}
      value={
        dayValue || open
          ? (
              <DateRangePicker
                ref={ref}
                picker={picker}
                showTime={showTime}
                format={format}
                {...fieldProps}
                placeholder={
                  fieldProps.placeholder ?? [
                    intl.getMessage('tableForm.selectPlaceholder', '请选择'),
                    intl.getMessage('tableForm.selectPlaceholder', '请选择'),
                  ]
                }
                variant={propsVariant ?? fieldProps?.variant}
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
          : null
      }
      variant={propsVariant}
      allowClear={false}
      ref={syncLightLabelRef}
      downIcon={dayValue || open ? false : undefined}
    />
  )

  if (formItemRender) {
    return formItemRender(text, { mode, ...fieldProps }, dom)
  }
  return dom
}

export default FieldRangePickerLightEdit
