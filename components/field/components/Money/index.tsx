import type { ProFieldFC } from '../../types'
import type { FieldMoneyProps } from './types'
import { useIntl } from '../../../provider'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldMoneyEdit from './FieldMoneyEdit'
import FieldMoneyRead from './FieldMoneyRead'
import { DefaultPrecisionCont } from './moneyFormat'

export type { FieldMoneyProps }
type FieldMoneyFieldProps = NonNullable<ProFieldFC<FieldMoneyProps>['__props']>

const FieldMoney: ProFieldFC<FieldMoneyProps> = (props) => {
  const intl = useIntl()
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
  } = props as FieldMoneyFieldProps

  const precision = fieldProps?.precision ?? DefaultPrecisionCont

  const customSymbol = propsCustomSymbol ?? fieldProps.customSymbol
  const moneySymbol = (() => {
    if (customSymbol)
      return customSymbol

    if (propsMoneySymbol === false || fieldProps.moneySymbol === false)
      return undefined

    return intl.getMessage('moneySymbol', '¥')
  })()

  const placeholderValue = placeholder || '请输入'
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
    })
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
    })
  }

  return null
}

export default FieldMoney
