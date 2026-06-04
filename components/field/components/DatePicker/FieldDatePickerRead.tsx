import type { PropType } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { defineComponent } from 'vue'
import { formatDate } from './datePickerUtils'

export default defineComponent({
  name: 'FieldDatePickerRead',
  props: {
    text: { type: [String, Number, Object] as PropType<string | number | Record<string, any>>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    format: { type: String, default: 'YYYY-MM-DD' },
    picker: { type: String as PropType<'time' | 'date' | 'week' | 'month' | 'quarter' | 'year'>, default: undefined },
  },
  setup(props) {
    return () => {
      const mergedPicker = props.fieldProps?.picker ?? props.picker
      const dom = <>{formatDate(props.text, props.fieldProps.format || props.format, mergedPicker)}</>
      if (props.render)
        return props.render(props.text, { mode: props.mode, ...props.fieldProps }, dom)
      return dom
    }
  },
})
