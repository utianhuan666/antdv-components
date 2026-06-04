import type { PropType } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { Tooltip } from 'antdv-next'
import dayjs from 'dayjs'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldFromNowRead',
  props: {
    text: { type: String, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: any) => any>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    format: { type: String as PropType<string>, default: undefined },
  },
  setup(props) {
    return () => {
      const dom = (
        <Tooltip
          title={dayjs(props.text).format(
            props.fieldProps?.format || props.format || 'YYYY-MM-DD HH:mm:ss',
          )}
        >
          {dayjs(props.text).fromNow()}
        </Tooltip>
      )
      if (props.render) {
        return props.render(props.text, { mode: props.mode, ...props.fieldProps }, <>{dom}</>)
      }
      return <>{dom}</>
    }
  },
})
