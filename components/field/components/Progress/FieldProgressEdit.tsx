import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { InputNumber } from 'antdv-next'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldProgressEdit',
  props: {
    text: { type: [Number, String] as PropType<number | string>, default: undefined },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'edit' },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: VNodeChild) => VNodeChild>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    placeholderValue: { type: String, required: true },
  },
  setup(props) {
    return () => {
      const dom = (
        <InputNumber
          {...({
            placeholder: props.placeholderValue,
            ...props.fieldProps,
          } as any)}
        />
      )

      if (props.formItemRender)
        return props.formItemRender(props.text, { mode: props.mode, ...props.fieldProps }, dom)

      return dom
    }
  },
})
