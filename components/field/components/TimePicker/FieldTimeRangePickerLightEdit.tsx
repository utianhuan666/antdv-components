import type { PropType } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { TimeRangePicker } from 'antdv-next'
import { defineComponent, ref } from 'vue'
import FieldLabel from '../../../form/layouts/LightFilter/FieldLabel'
import { parseValueToDay } from '../DatePicker/datePickerUtils'

export default defineComponent({
  name: 'FieldTimeRangePickerLightEdit',
  props: {
    text: { type: Array as PropType<any[]>, default: () => [] },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'edit' },
    label: { type: null as unknown as PropType<any>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    format: { type: String, default: 'HH:mm:ss' },
    finalFormat: { type: String, default: 'HH:mm:ss' },
    variant: { type: String as PropType<'outlined' | 'borderless' | 'filled' | 'underlined'>, default: undefined },
  },
  setup(props) {
    const open = ref(false)

    return () => {
      const parsedValue = parseValueToDay(props.fieldProps.value, props.finalFormat)
      const dayValue = Array.isArray(parsedValue) && parsedValue.length === 2
        ? [parsedValue[0], parsedValue[1]] as [any, any]
        : undefined
      const {
        disabled,
        placeholder = ['请选择', '请选择'],
      } = props.fieldProps || {}
      const handleLabelClick = () => {
        if (disabled)
          return
        props.fieldProps?.onOpenChange?.(true)
        open.value = true
      }
      const handleRangeChange = (nextValue: any) => {
        props.fieldProps?.onChange?.(nextValue)
        if (!nextValue)
          open.value = false
      }
      const pickerDom = dayValue || open.value
        ? (
            <TimeRangePicker
              format={props.format}
              {...props.fieldProps}
              variant={props.variant ?? props.fieldProps?.variant}
              placeholder={placeholder}
              value={dayValue}
              onOpenChange={(nextOpen: boolean) => {
                open.value = nextOpen
                props.fieldProps?.onOpenChange?.(nextOpen)
              }}
              onChange={handleRangeChange}
              open={open.value}
            />
          )
        : undefined

      const dom = (
        <FieldLabel
          label={props.label}
          value={pickerDom}
          disabled={disabled}
          allowClear={false}
          downIcon={dayValue || open.value ? false : undefined}
          variant={props.variant}
          placeholder={placeholder}
          style={dayValue ? { paddingInlineEnd: 0 } : undefined}
          onLabelClick={handleLabelClick}
        />
      )

      if (props.formItemRender)
        return props.formItemRender(props.text, { mode: props.mode, ...props.fieldProps }, dom)
      return dom
    }
  },
})
