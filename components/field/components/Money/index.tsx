import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { FieldMoneyProps } from './types'
import { computed, defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldMoneyEdit from './FieldMoneyEdit'
import FieldMoneyRead from './FieldMoneyRead'
import { DefaultPrecisionCont } from './moneyFormat'

export type { FieldMoneyProps }

export default defineComponent({
  name: 'FieldMoney',
  props: {
    text: { type: [Number, String] as PropType<number | string>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: VNodeChild) => VNodeChild>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: VNodeChild) => VNodeChild>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
    placeholder: { type: String, default: undefined },
    locale: { type: String, default: undefined },
    customSymbol: { type: String, default: undefined },
    moneySymbol: { type: Boolean, default: undefined },
    numberPopoverRender: { type: [Function, Boolean] as PropType<FieldMoneyProps['numberPopoverRender']>, default: undefined },
    numberFormatOptions: { type: Object as PropType<FieldMoneyProps['numberFormatOptions']>, default: undefined },
  },
  setup(props) {
    const precision = computed(() => props.fieldProps?.precision ?? DefaultPrecisionCont)

    const moneySymbol = computed((): string | undefined => {
      const customSymbol = props.customSymbol ?? props.fieldProps.customSymbol
      if (customSymbol)
        return customSymbol

      if (props.moneySymbol === false || props.fieldProps.moneySymbol === false)
        return undefined

      return '¥'
    })

    const placeholderValue = computed(() => props.placeholder || '请输入')

    const numberPopoverRender = computed(
      () => props.numberPopoverRender ?? props.fieldProps.numberPopoverRender ?? false,
    )

    const getFormateValue = (value?: string | number): string => {
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
        return (
          <FieldMoneyRead
            text={props.text}
            mode={props.mode}
            render={props.render}
            fieldProps={props.fieldProps}
            locale={props.locale}
            precision={precision.value}
            numberFormatOptions={props.numberFormatOptions ?? props.fieldProps.numberFormatOptions}
            moneySymbol={moneySymbol.value}
          />
        )
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        return (
          <FieldMoneyEdit
            text={props.text}
            mode={props.mode}
            formItemRender={props.formItemRender}
            fieldProps={props.fieldProps}
            locale={props.locale}
            precision={precision.value}
            placeholderValue={placeholderValue.value}
            moneySymbol={moneySymbol.value}
            numberPopoverRender={numberPopoverRender.value}
            numberFormatOptions={props.numberFormatOptions ?? props.fieldProps.numberFormatOptions}
            getFormateValue={getFormateValue}
          />
        )
      }

      return null
    }
  },
})
