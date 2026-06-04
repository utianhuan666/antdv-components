import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldSwitchRead',
  props: {
    text: { type: [Boolean, String, Number] as PropType<boolean | string | number>, default: undefined },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    readLabel: { type: null as unknown as PropType<VNodeChild>, default: '-' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  },
  setup(props) {
    return () => {
      if (props.render)
        return props.render(props.text, { mode: props.mode, ...props.fieldProps }, <>{props.readLabel}</>)

      return props.readLabel ?? '-'
    }
  },
})
