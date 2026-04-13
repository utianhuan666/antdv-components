import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { FieldMoneyProps } from './types'
import { computed, defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import InputNumberPopover from './InputNumberPopover'
import { DefaultPrecisionCont, getTextByLocale } from './moneyFormat'

export type { FieldMoneyProps }

export default defineComponent({
  name: 'FieldMoney',
  props: {
    text: { type: [Number, String] as PropType<number | string>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
    placeholder: { type: String, default: undefined },
    locale: { type: String, default: undefined },
    customSymbol: { type: String, default: undefined },
    moneySymbol: { type: Boolean, default: undefined },
    numberPopoverRender: { type: [Function, Boolean] as PropType<FieldMoneyProps['numberPopoverRender']>, default: false },
    numberFormatOptions: { type: Object as PropType<FieldMoneyProps['numberFormatOptions']>, default: undefined },
  },
  setup(props) {
    const precision = computed(() => props.fieldProps?.precision ?? DefaultPrecisionCont)

    const moneySymbol = computed((): string | undefined => {
      if (props.customSymbol || props.fieldProps.customSymbol) {
        return props.customSymbol || props.fieldProps.customSymbol
      }
      if (props.moneySymbol === false || props.fieldProps.moneySymbol === false) {
        return undefined
      }
      return '?'
    })

    const placeholderValue = computed(() => props.placeholder || '???')

    const getFormatValue = (value?: string | number): string => {
      const reg = new RegExp(
        `\\B(?=(\\d{${3 + Math.max(precision.value - DefaultPrecisionCont, 0)}})+(?!\\d))`,
        'g',
      )
      const parts = String(value).split('.')
      const intStr = parts[0] ?? ''
      const floatStr = parts[1]
      const resultInt = intStr.replace(reg, ',')
      let resultFloat = ''
      if (floatStr && precision.value > 0) {
        resultFloat = `.${floatStr.slice(
          0,
          precision.value === undefined ? DefaultPrecisionCont : precision.value,
        )}`
      }
      return `${resultInt}${resultFloat}`
    }

    return () => {
      if (isProFieldReadMode(props.mode)) {
        const dom = (
          <span>
            {getTextByLocale(
              props.locale || false,
              props.text,
              precision.value,
              props.numberFormatOptions ?? props.fieldProps.numberFormatOptions,
              moneySymbol.value,
            )}
          </span>
        )
        if (props.render) {
          return props.render(props.text, { mode: props.mode, ...props.fieldProps }, dom) ?? props.emptyText
        }
        return dom
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        const {
          numberFormatOptions: _nf,
          precision: _p,
          numberPopoverRender: _np,
          customSymbol: _cs,
          moneySymbol: _ms,
          visible: _vi,
          open: _op,
          onChange: fieldOnChange,
          onBlur: fieldOnBlur,
          ...restFieldProps
        } = props.fieldProps

        const numberPopoverRenderVal = props.numberPopoverRender || props.fieldProps.numberPopoverRender

        const dom = (
          <InputNumberPopover
            {...({
              contentRender: (p: Record<string, any>) => {
                if (numberPopoverRenderVal === false)
                  return null
                if (!p.value)
                  return null
                const localeText = getTextByLocale(
                  moneySymbol.value || props.locale || false,
                  `${getFormatValue(p.value)}`,
                  precision.value,
                  {
                    ...(props.numberFormatOptions),
                    notation: 'compact',
                  },
                  moneySymbol.value,
                )
                if (typeof numberPopoverRenderVal === 'function') {
                  return numberPopoverRenderVal(p, String(localeText))
                }
                return <span>{localeText}</span>
              },
              precision: precision.value,
              formatter: (value: string | number | undefined) => {
                if (value && moneySymbol.value) {
                  return `${moneySymbol.value} ${getFormatValue(value)}`
                }
                return value?.toString() || (value as string)
              },
              parser: (value: string | undefined) => {
                if (moneySymbol.value && value) {
                  return value.replace(
                    new RegExp(`\\${moneySymbol.value}\\s?|(,*)`, 'g'),
                    '',
                  )
                }
                return value!
              },
              placeholder: placeholderValue.value,
              ...restFieldProps,
              onChange: fieldOnChange,
              onBlur: fieldOnBlur
                ? (e: FocusEvent) => {
                    let value = (e.target as HTMLInputElement).value
                    if (moneySymbol.value && value) {
                      value = value.replace(
                        new RegExp(`\\${moneySymbol.value}\\s?|(,*)`, 'g'),
                        '',
                      )
                    }
                    fieldOnBlur(value)
                  }
                : undefined,
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
