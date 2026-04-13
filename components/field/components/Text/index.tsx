import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { Input } from 'antdv-next'
import { defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'

export default defineComponent({
  name: 'FieldText',
  props: {
    text: { type: [String, Number, Boolean, Array] as PropType<string | number | boolean | unknown[]>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
  },
  setup(props) {
    return () => {
      if (isProFieldReadMode(props.mode)) {
        const { prefix = '', suffix = '' } = props.fieldProps || {}
        const dom = (
          <>
            {prefix}
            {props.text ?? props.emptyText}
            {suffix}
          </>
        )
        if (props.render) {
          return props.render(props.text, { mode: props.mode, ...props.fieldProps }, dom) ?? props.emptyText
        }
        return dom
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        const dom = (
          <Input
            placeholder="???"
            allowClear
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
