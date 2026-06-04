import type { PropType } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { TimePicker } from 'antdv-next'
import { defineComponent, ref } from 'vue'
import FieldLabel from '../../../form/layouts/LightFilter/FieldLabel'
import { parseValueToDay } from '../DatePicker/datePickerUtils'

export default defineComponent({
  name: 'FieldTimePickerLightEdit',
  props: {
    text: { type: null as unknown as PropType<any>, default: undefined },
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
      const { disabled, value } = props.fieldProps || {}
      const dayValue = parseValueToDay(value, props.finalFormat)
      const handleLabelClick = () => {
        if (disabled)
          return
        props.fieldProps?.onOpenChange?.(true)
        open.value = true
      }
      const pickerDom = dayValue || open.value
        ? (
            <TimePicker
              format={props.format}
              {...props.fieldProps}
              variant={props.variant ?? props.fieldProps?.variant}
              placeholder={props.fieldProps?.placeholder ?? '请选择'}
              value={dayValue}
              onOpenChange={(nextOpen: boolean) => {
                open.value = nextOpen
                props.fieldProps?.onOpenChange?.(nextOpen)
              }}
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
          variant={props.variant ?? props.fieldProps?.variant}
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
