import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldDigitRead',
  props: {
    text: { type: [Number, String] as PropType<number | string>, default: undefined },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: VNodeChild) => VNodeChild>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  },
  setup(props) {
    return () => {
      let fractionDigits: Intl.NumberFormatOptions = {}
      if (props.fieldProps?.precision) {
        fractionDigits = {
          minimumFractionDigits: Number(props.fieldProps.precision),
          maximumFractionDigits: Number(props.fieldProps.precision),
        }
      }

      const digit = new Intl.NumberFormat(undefined, {
        ...fractionDigits,
        ...(props.fieldProps?.intlProps || {}),
      }).format(Number(props.text))

      const dom = !props.fieldProps?.stringMode
        ? (
            <span>
              {props.fieldProps?.formatter?.(digit) || digit}
            </span>
          )
        : (
            <span>{props.text}</span>
          )

      if (props.render)
        return props.render(props.text, { mode: props.mode, ...props.fieldProps }, dom)

      return dom
    }
  },
})
