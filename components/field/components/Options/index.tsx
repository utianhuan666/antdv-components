import type { PropType } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldOptions',
  props: {
    text: { type: [Array, Object] as PropType<unknown[] | JSX.Element>, default: () => [] },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  },
  setup(props) {
    return () => {
      // Options is always read-like; it renders action links/buttons
      if (props.render) {
        const doms = props.render(props.text, { mode: props.mode, ...props.fieldProps }, <></>) as unknown as JSX.Element[]
        if (!doms || !Array.isArray(doms) || doms.length < 1) {
          return null
        }
        return (
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            {doms.map((dom, index) => (
              <span key={index}>{dom}</span>
            ))}
          </div>
        )
      }

      if (!props.text || !Array.isArray(props.text)) {
        return null
      }

      return (
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}
        >
          {(props.text as unknown[]).map((dom, index) => (
            <span key={index}>{dom}</span>
          ))}
        </div>
      )
    }
  },
})
