import type { PropType } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { DatePicker } from 'antdv-next'
import dayjs from 'dayjs'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldFromNowEdit',
  props: {
    text: { type: String, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'edit' },
    variant: { type: String as PropType<'outlined' | 'borderless' | 'filled' | 'underlined'>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: any) => any>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  },
  setup(props) {
    return () => {
      const fieldValue = props.fieldProps?.value
      const momentValue = fieldValue ? (dayjs.isDayjs(fieldValue) ? fieldValue : dayjs(fieldValue)) : undefined
      const dom = (
        <DatePicker
          placeholder="请选择"
          showTime
          variant={props.variant ?? props.fieldProps?.variant ?? 'outlined'}
          {...props.fieldProps}
          value={momentValue}
        />
      )
      if (props.formItemRender) {
        return props.formItemRender(props.text, { mode: props.mode, ...props.fieldProps }, dom)
      }
      return dom
    }
  },
})
