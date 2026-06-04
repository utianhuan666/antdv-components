import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { Value, ValuePair } from './types'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldDigitRangeRead',
  props: {
    text: { type: Array as PropType<ValuePair>, default: () => [] },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: VNodeChild) => VNodeChild>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    separator: { type: String, default: '~' },
  },
  setup(props) {
    const getContent = (number: Value) => {
      const digit = new Intl.NumberFormat(undefined, {
        minimumSignificantDigits: 2,
        ...(props.fieldProps?.intlProps || {}),
      }).format(Number(number))

      return props.fieldProps?.formatter?.(digit) || digit
    }

    return () => {
      const dom = (
        <span>
          {getContent(props.text[0])}
          {' '}
          {props.separator}
          {' '}
          {getContent(props.text[1])}
        </span>
      )

      if (props.render)
        return props.render(props.text, { mode: props.mode, ...props.fieldProps }, dom)

      return dom
    }
  },
})
