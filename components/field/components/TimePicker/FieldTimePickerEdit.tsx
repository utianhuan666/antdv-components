import type { PropType } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { TimePicker } from 'antdv-next'
import dayjs from 'dayjs'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldTimePickerEdit',
  props: {
    text: { type: null as unknown as PropType<any>, default: undefined },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'edit' },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    format: { type: String, default: 'HH:mm:ss' },
  },
  setup(props) {
    return () => {
      const { value, defaultValue, valueFormat, ...restFieldProps } = props.fieldProps || {}
      const mergedValue = value ?? props.text
      const mergedValueFormat = valueFormat || props.format
      const normalizeValue = (timeValue: any) => {
        if (!timeValue)
          return undefined
        return dayjs.isDayjs(timeValue) ? timeValue.format(mergedValueFormat) : timeValue
      }

      const dom = (
        <TimePicker
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
