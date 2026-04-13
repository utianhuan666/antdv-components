import type { PropType } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import dayjs from 'dayjs'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldTimePickerRead',
  props: {
    text: { type: [String, Number] as PropType<string | number>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    finalFormat: { type: String, default: 'HH:mm:ss' },
  },
  setup(props) {
    return () => {
      const isNumberOrDayjs = dayjs.isDayjs(props.text) || typeof props.text === 'number'
      const formatted = props.text
        ? dayjs(props.text as any, isNumberOrDayjs ? undefined : props.finalFormat).format(props.finalFormat)
        : '-'
      const dom = <span>{formatted}</span>
      if (props.render) {
        return props.render(props.text, { mode: props.mode, ...props.fieldProps }, dom) ?? '-'
      }
      return dom
    }
  },
})
