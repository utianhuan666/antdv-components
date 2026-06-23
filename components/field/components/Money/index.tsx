import type { ProFieldFC } from '../../types'
import type { FieldMoneyProps } from './types'
import { defineComponent, ref } from 'vue'
import { intlMap as allIntlMap, useIntl } from '../../../provider'
import { createRefProxy } from '../../../utils/createRefProxy'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldMoneyEdit from './FieldMoneyEdit'
import FieldMoneyRead from './FieldMoneyRead'
import { DefaultPrecisionCont } from './moneyFormat'

export type { FieldMoneyProps }
type FieldMoneyInstance = InstanceType<typeof import('antdv-next')['InputNumber']>
type FieldMoneyInnerRef = FieldMoneyInstance | HTMLSpanElement
export type FieldMoneyExpose = Partial<FieldMoneyInstance> & Partial<HTMLSpanElement>
type FieldMoneyFieldProps = NonNullable<ProFieldFC<FieldMoneyProps>['__props']>

/**
 * 金额组件
 */
const FieldMoney = defineComponent<FieldMoneyFieldProps>({
  name: 'FieldMoney',
  inheritAttrs: false,
  props: [
    'text',
    'mode',
    'render',
    'formItemRender',
    'fieldProps',
    'placeholder',
    'locale',
    'customSymbol',
    'moneySymbol',
    'numberPopoverRender',
    'numberFormatOptions',
  ],
  setup(rawProps, { expose }) {
    const baseIntl = useIntl()
    const innerRef = ref<FieldMoneyInnerRef | null>(null)

    expose(createRefProxy<FieldMoneyInnerRef>(innerRef))

    return () => {
      const props = rawProps as FieldMoneyFieldProps
      const {
        text = '' as unknown as FieldMoneyProps['text'],
        mode: type = 'read',
        render,
        formItemRender,
        fieldProps = {},
        placeholder,
        locale,
        customSymbol: propsCustomSymbol,
        moneySymbol: propsMoneySymbol,
        numberPopoverRender: propsNumberPopoverRender,
        numberFormatOptions: propsNumberFormatOptions,
      } = props

      const precision = fieldProps?.precision ?? DefaultPrecisionCont

      let intl = baseIntl
      if (locale && allIntlMap[locale as keyof typeof allIntlMap])
        intl = allIntlMap[locale as keyof typeof allIntlMap]

      const customSymbol = propsCustomSymbol ?? fieldProps.customSymbol
      const moneySymbol = (() => {
        if (customSymbol)
          return customSymbol

        if (propsMoneySymbol === false || fieldProps.moneySymbol === false)
          return undefined

        return intl.getMessage('moneySymbol', '¥')
      })()

      const placeholderValue = placeholder || intl.getMessage('tableForm.inputPlaceholder', '请输入')
      const numberPopoverRender = propsNumberPopoverRender ?? fieldProps.numberPopoverRender ?? false
      const numberFormatOptions = propsNumberFormatOptions ?? fieldProps.numberFormatOptions

      const getFormateValue = (value?: string | number): string => {
        const reg = new RegExp(
          `\\B(?=(\\d{${3 + Math.max(precision - DefaultPrecisionCont, 0)}})+(?!\\d))`,
          'g',
        )
        const parts = String(value).split('.')
        const intStr = parts[0] ?? ''
        const floatStr = parts[1]
        const resultInt = intStr.replace(reg, ',')
        let resultFloat = ''
        if (floatStr && precision > 0) {
          resultFloat = `.${floatStr.slice(
            0,
            precision === undefined ? DefaultPrecisionCont : precision,
          )}`
        }
        return `${resultInt}${resultFloat}`
      }

      if (isProFieldReadMode(type)) {
        return FieldMoneyRead({
          text,
          mode: type,
          render,
          formItemRender,
          fieldProps,
          placeholder,
          locale,
          customSymbol,
          numberPopoverRender,
          numberFormatOptions,
          precision,
          moneySymbol,
        }, innerRef)
      }

      if (isProFieldEditOrUpdateMode(type)) {
        return FieldMoneyEdit({
          text,
          mode: type,
          render,
          formItemRender,
          fieldProps,
          placeholder,
          locale,
          customSymbol,
          numberPopoverRender,
          numberFormatOptions,
          precision,
          placeholderValue,
          moneySymbol,
          getFormateValue,
        }, innerRef)
      }

      return null
    }
  },
})

export default FieldMoney
