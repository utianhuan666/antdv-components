import type { PropType } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { Input } from 'antdv-next'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldTextEdit',
  props: {
    text: { type: [String, Number, Boolean, Array] as PropType<string | number | boolean | unknown[]>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'edit' },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: any) => any>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  },
  setup(props) {
    return () => {
      const dom = (
        <Input
          placeholder="请输入"
          allowClear
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
