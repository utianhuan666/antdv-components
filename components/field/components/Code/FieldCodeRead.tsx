import type { CSSProperties, PropType } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldCodeRead',
  props: {
    code: { type: String, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: any) => any>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  },
  setup(props) {
    return () => {
      const dom = (
        <pre
          {...props.fieldProps}
          style={{
            padding: 16,
            overflow: 'auto',
            fontSize: '85%',
            lineHeight: 1.45,
            color: 'rgba(0, 0, 0, 0.45)',
            fontFamily: 'SFMono-Regular, Consolas, \'Liberation Mono\', Menlo, Courier, monospace',
            backgroundColor: 'rgba(150, 150, 150, 0.1)',
            borderRadius: 3,
            width: 'min-content',
            ...(props.fieldProps?.style as CSSProperties),
          }}
        >
          <code>{props.code}</code>
        </pre>
      )
      if (props.render) {
        return props.render(props.code, { mode: props.mode, ...props.fieldProps }, dom)
      }
      return dom
    }
  },
})
