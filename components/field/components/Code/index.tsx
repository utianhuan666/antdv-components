import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { computed, defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldCodeEdit from './FieldCodeEdit'
import FieldCodeRead from './FieldCodeRead'
import { languageFormat } from './utils'

export default defineComponent({
  name: 'FieldCode',
  props: {
    text: { type: String as PropType<string>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: any) => any>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: any) => any>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
    language: { type: String as PropType<'json' | 'text'>, default: 'text' },
  },
  setup(props) {
    const code = computed(() => languageFormat(props.text, props.language))

    return () => {
      if (isProFieldReadMode(props.mode)) {
        return (
          <FieldCodeRead
            code={code.value}
            mode={props.mode}
            render={props.render}
            fieldProps={props.fieldProps}
          />
        )
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        return (
          <FieldCodeEdit
            code={code.value}
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
