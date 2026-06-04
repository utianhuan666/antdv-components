import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { defineComponent, Fragment } from 'vue'
import { getColorByRealValue, getRealTextWithPrecision, getSymbolByRealValue } from './util'

export default defineComponent({
  name: 'FieldPercentRead',
  props: {
    text: { type: [Number, String] as PropType<number | string>, default: undefined },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: VNodeChild) => VNodeChild>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    prefix: { type: null as unknown as PropType<VNodeChild>, default: undefined },
    suffix: { type: null as unknown as PropType<VNodeChild>, default: '%' },
    precision: { type: Number, default: undefined },
    showColor: { type: Boolean, default: false },
    realValue: { type: Number, required: true },
    showSymbol: { type: Boolean, default: undefined },
  },
  setup(props) {
    return () => {
      const style = props.showColor ? { color: getColorByRealValue(props.realValue) } : {}
      const dom = (
        <span style={style}>
          {props.prefix && <span>{props.prefix}</span>}
          {props.showSymbol && (
            <Fragment>
              {getSymbolByRealValue(props.realValue)}
              {' '}
            </Fragment>
          )}
          {getRealTextWithPrecision(Math.abs(props.realValue), props.precision)}
          {props.suffix}
        </span>
      )

      if (props.render) {
        return props.render(
          props.text,
          {
            mode: props.mode,
            ...props.fieldProps,
            prefix: props.prefix,
            precision: props.precision,
            showSymbol: props.showSymbol,
            suffix: props.suffix,
          },
          dom,
        )
      }

      return dom
    }
  },
})
