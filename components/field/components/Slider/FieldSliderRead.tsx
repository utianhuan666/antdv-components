import type { PropType } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldSliderRead',
  props: {
    text: { type: [String, Number, Array] as PropType<string | number | number[]>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  },
  setup(props) {
    return () => {
      const dom = <>{props.text}</>

      if (props.render)
        return props.render(props.text, { mode: props.mode, ...props.fieldProps }, dom)

      return dom
    }
  },
})
