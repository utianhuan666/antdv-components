import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldTextAreaEdit from './FieldTextAreaEdit'
import FieldTextAreaRead from './FieldTextAreaRead'

export default defineComponent({
  name: 'FieldTextArea',
  props: {
    text: { type: [String, Number] as PropType<string | number>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: any) => any>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: any) => any>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
  },
  setup(props) {
    return () => {
      if (isProFieldReadMode(props.mode)) {
        return (
          <FieldTextAreaRead
            text={props.text}
            mode={props.mode}
            render={props.render}
            fieldProps={props.fieldProps}
            emptyText={props.emptyText}
          />
        )
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        return (
          <FieldTextAreaEdit
            text={props.text}
            mode={props.mode}
            formItemRender={props.formItemRender}
            fieldProps={props.fieldProps}
          />
        )
      }

      return null
    }
  },
})
