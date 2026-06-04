import type { PropType } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { TimeRangePicker } from 'antdv-next'
import { defineComponent } from 'vue'
import { parseValueToDay } from '../DatePicker/datePickerUtils'

export default defineComponent({
  name: 'FieldTimeRangePickerEdit',
  props: {
    text: { type: Array as PropType<(string | number)[]>, default: () => [] },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'edit' },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    format: { type: String, default: 'HH:mm:ss' },
    finalFormat: { type: String, default: 'HH:mm:ss' },
    variant: { type: String as PropType<'outlined' | 'borderless' | 'filled' | 'underlined'>, default: undefined },
  },
  setup(props) {
    return () => {
      const parsedValue = parseValueToDay(props.fieldProps.value, props.finalFormat)
      const dayValue = Array.isArray(parsedValue) && parsedValue.length === 2
        ? [parsedValue[0], parsedValue[1]] as [any, any]
        : undefined
      const dom = (
        <TimeRangePicker
          format={props.format}
          {...props.fieldProps}
          variant={props.variant ?? props.fieldProps?.variant}
          value={dayValue}
        />
      )
      if (props.formItemRender) {
        return props.formItemRender(props.text, { mode: props.mode, ...props.fieldProps }, dom)
      }
      return dom
    }
  },
})
