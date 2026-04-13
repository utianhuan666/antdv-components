import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { FieldSecondProps } from './types'
import { InputNumber } from 'antdv-next'
import { defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import { formatSecond } from './utils'

export { formatSecond }
export type { FieldSecondProps }

export default defineComponent({
  name: 'FieldSecond',
  props: {
    text: { type: [Number, String] as PropType<number | string>, default: 0 },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
    placeholder: { type: String, default: undefined },
  },
  setup(props) {
    return () => {
      if (isProFieldReadMode(props.mode)) {
        const secondText = formatSecond(Number(props.text))
        const dom = <span>{secondText}</span>
        if (props.render) {
          return props.render(props.text, { mode: props.mode, ...props.fieldProps }, dom)
        }
        return dom
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        const placeholderValue = props.placeholder || '???'
        const dom = (
          <InputNumber
            {...({
              min: 0,
              style: { width: '100%' },
              placeholder: placeholderValue,
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
