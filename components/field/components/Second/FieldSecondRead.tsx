import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { defineComponent } from 'vue'
import { formatSecond } from './utils'

export default defineComponent({
  name: 'FieldSecondRead',
  props: {
    text: { type: [Number, String] as PropType<number | string>, default: undefined },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: VNodeChild) => VNodeChild>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  },
  setup(props) {
    return () => {
      const secondText = formatSecond(Number(props.text))
      const dom = <span>{secondText}</span>

      if (props.render)
        return props.render(props.text, { mode: props.mode, ...props.fieldProps }, dom)

      return dom
    }
  },
})
