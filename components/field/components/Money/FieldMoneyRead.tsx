import type { ProFieldFC } from '../../types'
import type { FieldMoneyProps } from './types'
import { getTextByLocale } from './moneyFormat'

type Props = Omit<NonNullable<ProFieldFC<FieldMoneyProps>['__props']>, 'moneySymbol'> & {
  precision: number
  moneySymbol: string | undefined
}

export function FieldMoneyRead(props: Props) {
  const {
    text,
    mode: type,
    render,
    fieldProps,
    locale,
    precision,
    numberFormatOptions,
    moneySymbol,
  } = props

  const dom = (
    <span>
      {getTextByLocale(
        locale || false,
        text,
        precision,
        numberFormatOptions ?? fieldProps.numberFormatOptions,
        moneySymbol,
      )}
    </span>
  )

  if (render)
    return render(text, { mode: type, ...fieldProps }, dom)

  return dom
}

export default FieldMoneyRead
