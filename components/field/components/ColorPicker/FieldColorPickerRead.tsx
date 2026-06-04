import type { PropType } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { ColorPicker } from 'antdv-next'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldColorPickerRead',
  props: {
    text: { type: String, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: any) => any>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  },
  setup(props) {
    return () => {
      const dom = (
        <ColorPicker
          value={props.text}
          class="ant-pro-field-color-picker"
          open={false}
        />
      )
      if (props.render) {
        return props.render(props.text, { mode: props.mode, ...props.fieldProps }, dom)
      }
      return dom
    }
  },
})
