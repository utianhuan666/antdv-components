import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { FieldImageProps } from './types'
import { defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldImageEdit from './FieldImageEdit'
import FieldImageRead from './FieldImageRead'

export type { FieldImageProps }

export default defineComponent({
  name: 'FieldImage',
  props: {
    text: { type: String as PropType<string>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: any) => any>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: any) => any>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
    placeholder: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    width: { type: Number as PropType<number>, default: undefined },
  },
  setup(props) {
    return () => {
      if (isProFieldReadMode(props.mode)) {
        return (
          <FieldImageRead
            text={props.text}
            mode={props.mode}
            render={props.render}
            fieldProps={props.fieldProps}
            width={props.width}
          />
        )
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        const placeholderValue = (Array.isArray(props.placeholder) ? props.placeholder[0] : props.placeholder) || '请输入'
        return (
          <FieldImageEdit
            text={props.text}
            mode={props.mode}
            formItemRender={props.formItemRender}
            fieldProps={props.fieldProps}
            placeholderValue={placeholderValue}
          />
        )
      }

      return null
    }
  },
})
