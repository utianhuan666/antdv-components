import type { PropType } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { TextArea } from 'antdv-next'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldCodeEdit',
  props: {
    code: { type: String, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'edit' },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: any) => any>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  },
  setup(props) {
    return () => {
      const fp = { ...(props.fieldProps || {}), value: props.code }
      const dom = (
        <TextArea
          rows={5}
          {...fp}
        />
      )
      if (props.formItemRender) {
        return props.formItemRender(props.code, { mode: props.mode, ...fp }, dom) ?? null
      }
      return dom
    }
  },
})
