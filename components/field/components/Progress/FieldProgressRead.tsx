import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { Progress } from 'antdv-next'
import { defineComponent } from 'vue'
import { getProgressStatus } from './utils'

export default defineComponent({
  name: 'FieldProgressRead',
  props: {
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: VNodeChild) => VNodeChild>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    realValue: { type: [Number, String] as PropType<number | string>, required: true },
  },
  setup(props) {
    return () => {
      const dom = (
        <Progress
          size="small"
          style={{ minWidth: 100, maxWidth: 320 }}
          percent={props.realValue as number}
          steps={props.fieldProps?.steps}
          status={getProgressStatus(props.realValue as number)}
          {...props.fieldProps}
        />
      )

      if (props.render)
        return props.render(props.realValue, { mode: props.mode, ...props.fieldProps }, dom)

      return dom
    }
  },
})
