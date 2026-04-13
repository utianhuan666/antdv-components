import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { TextArea } from 'antdv-next'
import { defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'

export default defineComponent({
  name: 'FieldTextArea',
  props: {
    text: { type: [String, Number] as PropType<string | number>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
  },
  setup(props) {
    return () => {
      if (isProFieldReadMode(props.mode)) {
        const dom = (
          <span style={{ display: 'inline-block', lineHeight: '1.5715', maxWidth: '100%', whiteSpace: 'pre-wrap' }}>
            {props.text ?? props.emptyText}
          </span>
        )
        if (props.render) {
          return props.render(props.text, { mode: props.mode, ...props.fieldProps }, dom) ?? props.emptyText
        }
        return dom
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        const dom = (
          <TextArea
            rows={3}
            placeholder="???"
            {...props.fieldProps}
          />
        )
        if (props.formItemRender) {
          return props.formItemRender(props.text, { mode: props.mode, ...props.fieldProps }, dom)
        }
        return dom
      }

      return null
    }
  },
})
