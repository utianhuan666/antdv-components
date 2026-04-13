import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { TextArea } from 'antdv-next'
import { computed, defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import { languageFormat } from './utils'

export default defineComponent({
  name: 'FieldCode',
  props: {
    text: { type: String as PropType<string>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
    language: { type: String as PropType<'json' | 'text'>, default: 'text' },
  },
  setup(props) {
    const code = computed(() => languageFormat(props.text, props.language))

    return () => {
      if (isProFieldReadMode(props.mode)) {
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
              ...props.fieldProps?.style,
            }}
          >
            <code>{code.value}</code>
          </pre>
        )
        if (props.render) {
          return props.render(code.value, { mode: props.mode, ...props.fieldProps }, dom)
        }
        return dom
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        const fp = { ...(props.fieldProps || {}), value: code.value }
        const dom = (
          <TextArea
            rows={5}
            {...fp}
          />
        )
        if (props.formItemRender) {
          return props.formItemRender(code.value, { mode: props.mode, ...fp }, dom)
        }
        return dom
      }

      return null
    }
  },
})
