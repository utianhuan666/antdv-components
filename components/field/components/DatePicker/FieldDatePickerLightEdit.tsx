import type { PropType } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { DatePicker } from 'antdv-next'
import { defineComponent, ref } from 'vue'
import FieldLabel from '../../../form/layouts/LightFilter/FieldLabel'
import { parseValueToDay } from './datePickerUtils'

export default defineComponent({
  name: 'FieldDatePickerLightEdit',
  props: {
    text: { type: null as unknown as PropType<any>, default: undefined },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'edit' },
    label: { type: null as unknown as PropType<any>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    format: { type: String, default: 'YYYY-MM-DD' },
    showTime: { type: [Boolean, Object] as PropType<boolean | Record<string, any>>, default: undefined },
    picker: { type: String as PropType<'time' | 'date' | 'week' | 'month' | 'quarter' | 'year'>, default: undefined },
    variant: { type: String as PropType<'outlined' | 'borderless' | 'filled' | 'underlined'>, default: undefined },
  },
  setup(props) {
    const open = ref(false)

    return () => {
      const { disabled, value } = props.fieldProps || {}
      const dayValue = parseValueToDay(value, props.format)
      const handleLabelClick = () => {
        if (disabled)
          return
        props.fieldProps?.onOpenChange?.(true)
        open.value = true
      }

      const pickerDom = dayValue || open.value
        ? (
            <DatePicker
              picker={props.fieldProps?.picker ?? props.picker}
              showTime={props.showTime}
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
          variant={props.variant}
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
