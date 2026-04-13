import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { FieldImageProps } from './types'
import { Image, Input } from 'antdv-next'
import { defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'

export type { FieldImageProps }

export default defineComponent({
  name: 'FieldImage',
  props: {
    text: { type: String as PropType<string>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
    placeholder: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    width: { type: Number as PropType<number>, default: undefined },
  },
  setup(props) {
    return () => {
      if (isProFieldReadMode(props.mode)) {
        const dom = (
          <Image
            width={props.width || 32}
            src={props.text}
            {...props.fieldProps}
          />
        )
        if (props.render) {
          return props.render(props.text, { mode: props.mode, ...props.fieldProps }, dom)
        }
        return dom
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        const placeholderValue = (Array.isArray(props.placeholder) ? props.placeholder[0] : props.placeholder) || '???'
        const dom = (
          <Input
            placeholder={placeholderValue}
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
