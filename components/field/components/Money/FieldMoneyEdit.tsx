import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { FieldMoneyProps } from './types'
import { omit } from '@v-c/util'
import { defineComponent } from 'vue'
import InputNumberPopover from './InputNumberPopover'
import { getTextByLocale } from './moneyFormat'

export default defineComponent({
  name: 'FieldMoneyEdit',
  props: {
    text: { type: [Number, String] as PropType<number | string>, default: undefined },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'edit' },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: VNodeChild) => VNodeChild>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    locale: { type: String, default: undefined },
    precision: { type: Number, required: true },
    placeholderValue: { type: String, required: true },
    moneySymbol: { type: String, default: undefined },
    numberPopoverRender: { type: [Function, Boolean] as PropType<FieldMoneyProps['numberPopoverRender']>, default: false },
    numberFormatOptions: { type: Object as PropType<FieldMoneyProps['numberFormatOptions']>, default: undefined },
    getFormateValue: { type: Function as PropType<(value?: string | number) => string>, required: true },
  },
  setup(props) {
    return () => {
      const { onBlur } = props.fieldProps
      const restFieldProps = omit(props.fieldProps, [
        'numberFormatOptions',
        'precision',
        'numberPopoverRender',
        'customSymbol',
        'moneySymbol',
        'visible',
        'open',
        'onBlur',
      ])

      const dom = (
        <InputNumberPopover
          {...({
            contentRender: (popoverProps: Record<string, any>) => {
              if (props.numberPopoverRender === false)
                return null

              if (!popoverProps.value)
                return null

              const localeText = getTextByLocale(
                props.moneySymbol || props.locale || false,
                `${props.getFormateValue(popoverProps.value)}`,
                props.precision,
                {
                  ...props.numberFormatOptions,
                  notation: 'compact',
                },
                props.moneySymbol,
              )

              if (typeof props.numberPopoverRender === 'function')
                return props.numberPopoverRender(popoverProps, String(localeText))

              return localeText
            },
            precision: props.precision,
            formatter: (value: string | number | undefined) => {
              if (value && props.moneySymbol)
                return `${props.moneySymbol} ${props.getFormateValue(value)}`

              return value?.toString() || (value as string)
            },
            parser: (value: string | undefined) => {
              if (props.moneySymbol && value) {
                return value.replace(
                  new RegExp(`\\${props.moneySymbol}\\s?|(,*)`, 'g'),
                  '',
                )
              }
              return value!
            },
            placeholder: props.placeholderValue,
            ...restFieldProps,
            onBlur: onBlur
              ? (e: FocusEvent) => {
                  let value = (e.target as HTMLInputElement).value
                  if (props.moneySymbol && value) {
                    value = value.replace(
                      new RegExp(`\\${props.moneySymbol}\\s?|(,*)`, 'g'),
                      '',
                    )
                  }
                  onBlur(value)
                }
              : undefined,
          } as any)}
        />
      )

      if (props.formItemRender)
        return props.formItemRender(props.text, { mode: props.mode, ...props.fieldProps }, dom)

      return dom
    }
  },
})
