import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { FieldMoneyProps } from './types'
import { defineComponent } from 'vue'
import { getTextByLocale } from './moneyFormat'

export default defineComponent({
  name: 'FieldMoneyRead',
  props: {
    text: { type: [Number, String] as PropType<number | string>, default: undefined },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: VNodeChild) => VNodeChild>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    locale: { type: String, default: undefined },
    precision: { type: Number, required: true },
    numberFormatOptions: { type: Object as PropType<FieldMoneyProps['numberFormatOptions']>, default: undefined },
    moneySymbol: { type: String, default: undefined },
  },
  setup(props) {
    return () => {
      const dom = (
        <span>
          {getTextByLocale(
            props.locale || false,
            props.text,
            props.precision,
            props.numberFormatOptions ?? props.fieldProps.numberFormatOptions,
            props.moneySymbol,
          )}
        </span>
      )

      if (props.render)
        return props.render(props.text, { mode: props.mode, ...props.fieldProps }, dom)

      return dom
    }
  },
})
