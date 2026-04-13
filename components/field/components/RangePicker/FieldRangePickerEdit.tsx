import type { PropType } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { DateRangePicker } from 'antdv-next'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldRangePickerEdit',
  props: {
    text: { type: Array as PropType<string[]>, default: () => [] },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'edit' },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    format: { type: String, default: 'YYYY-MM-DD' },
    showTime: { type: [Boolean, Object] as PropType<boolean | Record<string, any>>, default: undefined },
    picker: { type: String as PropType<'time' | 'date' | 'week' | 'month' | 'quarter' | 'year'>, default: undefined },
  },
  setup(props) {
    return () => {
      const dom = (
        <DateRangePicker
          picker={props.picker}
          showTime={props.showTime}
          format={props.format}
          placeholder={['请选择', '请选择']}
          {...props.fieldProps}
        />
      )
      if (props.formItemRender) {
        return props.formItemRender(props.text, { mode: props.mode, ...props.fieldProps }, dom)
      }
      return dom
    }
  },
})
