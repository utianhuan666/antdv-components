import type { ProFieldFC } from '../../types'
import type { FieldMoneyProps } from './types'
import { omit } from '@v-c/util'
import InputNumberPopover from './InputNumberPopover'
import { getTextByLocale } from './moneyFormat'

type Props = Omit<NonNullable<ProFieldFC<FieldMoneyProps>['__props']>, 'moneySymbol'> & {
  precision: number
  placeholderValue: string
  moneySymbol: string | undefined
  numberPopoverRender: FieldMoneyProps['numberPopoverRender']
  numberFormatOptions: FieldMoneyProps['numberFormatOptions']
  getFormateValue: (value?: string | number) => string
}

export function FieldMoneyEdit(props: Props) {
  const {
    text,
    mode: type,
    formItemRender,
    fieldProps,
    locale,
    precision,
    placeholderValue,
    moneySymbol,
    numberPopoverRender,
    numberFormatOptions,
    getFormateValue,
  } = props
  const { onBlur } = fieldProps
  const restFieldProps = omit(fieldProps, [
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
          if (numberPopoverRender === false)
            return null

          if (!popoverProps.value)
            return null

          const localeText = getTextByLocale(
            moneySymbol || locale || false,
            `${getFormateValue(popoverProps.value)}`,
            precision,
            {
              ...numberFormatOptions,
              notation: 'compact',
            },
            moneySymbol,
          )

          if (typeof numberPopoverRender === 'function')
            return numberPopoverRender(popoverProps, String(localeText))

          return localeText
        },
        precision,
        formatter: (value: string | number | undefined) => {
          if (value && moneySymbol)
            return `${moneySymbol} ${getFormateValue(value)}`

          return value?.toString() || (value as string)
        },
        parser: (value: string | undefined) => {
          if (moneySymbol && value) {
            return value.replace(
              new RegExp(`\\${moneySymbol}\\s?|(,*)`, 'g'),
              '',
            )
          }
          return value!
        },
        placeholder: placeholderValue,
        ...restFieldProps,
        onBlur: onBlur
          ? (e: FocusEvent) => {
              let value = (e.target as HTMLInputElement).value
              if (moneySymbol && value) {
                value = value.replace(
                  new RegExp(`\\${moneySymbol}\\s?|(,*)`, 'g'),
                  '',
                )
              }
              onBlur(value)
            }
          : undefined,
      } as any)}
    />
  )

  if (formItemRender)
    return formItemRender(text, { mode: type, ...fieldProps }, dom)

  return dom
}

export default FieldMoneyEdit
