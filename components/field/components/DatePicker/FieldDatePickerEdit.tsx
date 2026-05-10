import type { PropType } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { DatePicker } from 'antdv-next'
import dayjs from 'dayjs'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldDatePickerEdit',
  props: {
    text: { type: null as unknown as PropType<any>, default: undefined },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'edit' },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    format: { type: String, default: 'YYYY-MM-DD' },
    showTime: { type: [Boolean, Object] as PropType<boolean | Record<string, any>>, default: undefined },
    picker: { type: String as PropType<'time' | 'date' | 'week' | 'month' | 'quarter' | 'year'>, default: undefined },
  },
  setup(props) {
    return () => {
      const { value, defaultValue, valueFormat, ...restFieldProps } = props.fieldProps || {}
      const mergedValue = value ?? props.text
      const mergedValueFormat = valueFormat || props.format
      const normalizeValue = (dateValue: any) => {
        if (!dateValue)
          return undefined
        return dayjs.isDayjs(dateValue) ? dateValue.format(mergedValueFormat) : dateValue
      }

      const dom = (
        <DatePicker
          picker={props.picker}
          showTime={props.showTime}
          format={props.format}
          valueFormat={mergedValueFormat}
          placeholder="请选择"
          {...restFieldProps}
          value={normalizeValue(mergedValue)}
          defaultValue={normalizeValue(defaultValue)}
        />
      )
      if (props.formItemRender) {
        return props.formItemRender(props.text, { mode: props.mode, ...props.fieldProps }, dom)
      }
      return dom
    }
  },
})
