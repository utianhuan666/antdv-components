import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldTextRead',
  props: {
    text: { type: [String, Number, Boolean, Array] as PropType<string | number | boolean | unknown[]>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: any) => any>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
  },
  setup(props) {
    return () => {
      const { prefix = '', suffix = '' } = props.fieldProps || {}
      const dom = (
        <>
          {prefix}
          {props.text ?? props.emptyText}
          {suffix}
        </>
      )

      if (props.render) {
        return props.render(props.text, { mode: props.mode, ...props.fieldProps }, dom) ?? props.emptyText
      }
      return dom
    }
  },
})
