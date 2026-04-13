import type { PropType } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldRangePickerRead',
  props: {
    text: { type: Array as PropType<string[]>, default: () => [] },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    parsedStartText: { type: String, default: '' },
    parsedEndText: { type: String, default: '' },
  },
  setup(props) {
    return () => {
      const dom = (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <div>{props.parsedStartText || '-'}</div>
          <div>~</div>
          <div>{props.parsedEndText || '-'}</div>
        </div>
      )
      if (props.render) {
        return props.render(props.text, { mode: props.mode, ...props.fieldProps }, dom) ?? '-'
      }
      return dom
    }
  },
})
