import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { omit } from '@v-c/util'
import { defineComponent } from 'vue'
import FieldTextAreaReadonly from './readonly'

export default defineComponent({
  name: 'FieldTextAreaRead',
  props: {
    text: { type: [String, Number] as PropType<string | number>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: any) => any>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
  },
  setup(props) {
    return () => {
      const dom = (
        <FieldTextAreaReadonly
          text={props.text}
          fieldProps={props.fieldProps}
          emptyText={props.emptyText}
        />
      )

      if (props.render) {
        return props.render(
          props.text,
          {
            text: props.text,
            mode: props.mode,
            ...omit(props.fieldProps || {}, ['showCount']),
          },
          dom,
        )
      }
      return dom
    }
  },
})
