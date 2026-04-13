import type { PropType } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { TimePicker } from 'antdv-next'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldTimePickerEdit',
  props: {
    text: { type: [String, Number] as PropType<string | number>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'edit' },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    format: { type: String, default: 'HH:mm:ss' },
  },
  setup(props) {
    return () => {
      const dom = (
        <TimePicker
          format={props.format}
          placeholder="请选择"
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
