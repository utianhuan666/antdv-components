import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { PercentPropInt } from './types'
import { InputNumber } from 'antdv-next'
import { computed, defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import { getColorByRealValue, getRealTextWithPrecision, getSymbolByRealValue, toNumber } from './util'

export type { PercentPropInt }

export default defineComponent({
  name: 'FieldPercent',
  props: {
    text: { type: [Number, String] as PropType<number | string>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
    placeholder: { type: String, default: undefined },
    prefix: { type: [String, Object] as PropType<string | JSX.Element>, default: undefined },
    suffix: { type: [String, Object] as PropType<string | JSX.Element>, default: '%' },
    precision: { type: Number, default: undefined },
    showColor: { type: Boolean, default: false },
    showSymbol: { type: [Boolean, Function] as PropType<boolean | ((value: any) => boolean)>, default: undefined },
  },
  setup(props) {
    const realValue = computed(() => {
      const text = props.text
      if (typeof text === 'string' && text.includes('%')) {
        return toNumber(text.replace('%', ''))
      }
      return toNumber(text)
    })

    const showSymbol = computed(() => {
      if (typeof props.showSymbol === 'function') {
        return props.showSymbol(props.text)
      }
      return props.showSymbol
    })

    const placeholderValue = computed(() => props.placeholder || '???')

    return () => {
      if (isProFieldReadMode(props.mode)) {
        const style = props.showColor ? { color: getColorByRealValue(realValue.value) } : {}
        const symbol = showSymbol.value ? getSymbolByRealValue(realValue.value) : null

        const dom = (
          <span style={style}>
            {props.prefix && <span>{props.prefix}</span>}
            {symbol && (
              <>
                {symbol}
                {' '}
              </>
            )}
            {getRealTextWithPrecision(Math.abs(realValue.value), props.precision)}
            {props.suffix && <span>{props.suffix}</span>}
          </span>
        )
        if (props.render) {
          return props.render(props.text, { mode: props.mode, ...props.fieldProps }, dom) ?? props.emptyText
        }
        return dom
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        const dom = (
          <InputNumber
            {...({
              formatter: (value: string | number | undefined) => {
                if (value && props.prefix) {
                  return `${props.prefix} ${value}`.replace(/\B(?=(\d{3})+(?!\d)$)/g, ',')
                }
                return value as string
              },
              parser: (value: string | undefined) => (value ? value.replace(/.*\s|,/g, '') : ''),
              placeholder: placeholderValue.value,
              ...props.fieldProps,
            } as any)}
          />
        )
        if (props.formItemRender) {
          return props.formItemRender(props.text, { mode: props.mode, ...props.fieldProps }, dom)
        }
        return dom
      }

      return null
    }
  },
})
