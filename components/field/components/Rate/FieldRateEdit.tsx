import type { PropType } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { Rate } from 'antdv-next'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldRateEdit',
  props: {
    text: { type: [String, Number] as PropType<string | number>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'edit' },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  },
  setup(props) {
    return () => {
      const dom = <Rate allowHalf {...props.fieldProps} />

      if (props.formItemRender)
        return props.formItemRender(props.text, { mode: props.mode, ...props.fieldProps }, dom)

      return dom
    }
  },
})
