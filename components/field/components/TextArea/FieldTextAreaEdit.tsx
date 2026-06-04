import type { PropType } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { TextArea } from 'antdv-next'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldTextAreaEdit',
  props: {
    text: { type: [String, Number] as PropType<string | number>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'edit' },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: any) => any>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  },
  setup(props) {
    return () => {
      const dom = (
        <TextArea
          rows={3}
          onKeydown={(event: KeyboardEvent) => {
            if (event.key === 'Enter')
              event.stopPropagation()
          }}
          placeholder="请输入"
          {...props.fieldProps}
        />
      )
      if (props.formItemRender) {
        return props.formItemRender(props.text, { mode: props.mode, ...props.fieldProps }, dom)
      }
      return dom
    }
  },
})
