import type { CSSProperties, PropType, VNodeChild } from 'vue'
import { omit } from '@v-c/util'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldTextAreaReadonly',
  props: {
    text: { type: [String, Number] as PropType<string | number>, default: '' },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
  },
  setup(props) {
    return () => {
      const fieldProps = omit(props.fieldProps || {}, ['autoSize', 'classNames', 'styles'])
      return (
        <span
          {...fieldProps}
          class={['ant-pro-field-readonly', 'ant-pro-field-readonly-textarea', fieldProps.class]}
          style={{
            display: 'inline-block',
            lineHeight: '1.5715',
            maxWidth: '100%',
            whiteSpace: 'pre-wrap',
            ...(fieldProps.style as CSSProperties),
          }}
        >
          {props.text ?? props.emptyText}
        </span>
      )
    }
  },
})
