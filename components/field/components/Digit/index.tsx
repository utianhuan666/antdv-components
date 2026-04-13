import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { FieldDigitProps } from './types'
import { InputNumber } from 'antdv-next'
import { defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import { isEmptyOrWhitespace, isNil } from './digitUtils'

export type { FieldDigitProps }

function proxyChange(
  value: number | string | null,
  fieldProps: Record<string, any>,
): number | string | undefined {
  let val = value ?? undefined

  if (!fieldProps.stringMode && typeof val === 'string') {
    const numVal = Number(val)
    if (Number.isNaN(numVal)) {
      const match = val.match(/^(\d+(?:\.\d+)?)/)
      if (match) {
        val = Number(match[1])
      }
      else {
        val = undefined
      }
    }
    else {
      val = numVal
    }
  }
  if (
    typeof val === 'number'
    && !isNil(val)
    && !isNil(fieldProps.precision)
  ) {
    val = Number(val.toFixed(fieldProps.precision))
  }
  return val
}

export default defineComponent({
  name: 'FieldDigit',
  props: {
    text: { type: [Number, String] as PropType<number | string>, default: '' },
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
        const { fieldProps } = props
        let fractionDigits: Intl.NumberFormatOptions = {}
        if (fieldProps.precision) {
          fractionDigits = {
            minimumFractionDigits: Number(fieldProps.precision),
            maximumFractionDigits: Number(fieldProps.precision),
          }
        }
        const digit = new Intl.NumberFormat(undefined, {
          ...fractionDigits,
          ...(fieldProps.intlProps || {}),
        }).format(Number(props.text))

        const dom = !fieldProps.stringMode
          ? (
              <span>
                {fieldProps.formatter?.(digit) || digit}
              </span>
            )
          : (
              <span>{props.text}</span>
            )

        if (props.render) {
          return props.render(props.text, { mode: props.mode, ...props.fieldProps }, dom) ?? props.emptyText
        }
        return dom
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        const { fieldProps } = props
        const placeholderValue = props.placeholder || '???'

        // Strip onChange/onBlur from fieldProps so we can wrap them
        const { onChange: fieldOnChange, onBlur: fieldOnBlur, ...restFieldProps } = fieldProps

        const dom = (
          <InputNumber
            {...({
              min: 0,
              placeholder: placeholderValue,
              ...restFieldProps,
              onChange: (e: number | string | null) => {
                fieldOnChange?.(proxyChange(e, fieldProps))
              },
              onBlur: (e: FocusEvent) => {
                const value = (e.target as HTMLInputElement).value
                if (isEmptyOrWhitespace(value)) {
                  fieldOnBlur?.(e)
                  return
                }
                const processedValue = proxyChange(value, fieldProps)
                if (typeof processedValue === 'number') {
                  ;(e.target as HTMLInputElement).value = processedValue.toString()
                  fieldOnChange?.(processedValue)
                }
                fieldOnBlur?.(e)
              },
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
