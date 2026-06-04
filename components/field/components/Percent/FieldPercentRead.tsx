import type { ProFieldFC } from '../../types'
import type { PercentPropInt } from './types'
import { Fragment } from 'vue'
import { getColorByRealValue, getRealTextWithPrecision, getSymbolByRealValue } from './util'

type Props = NonNullable<ProFieldFC<PercentPropInt>['__props']> & {
  realValue: number
  showSymbol: boolean | undefined
}

export function FieldPercentRead(props: Props) {
  const {
    text,
    prefix,
    precision,
    mode,
    showColor = false,
    render,
    fieldProps,
    suffix = '%',
    realValue,
    showSymbol,
  } = props

  const style = showColor ? { color: getColorByRealValue(realValue) } : {}
  const dom = (
    <span style={style}>
      {prefix && <span>{prefix}</span>}
      {showSymbol && (
        <Fragment>
          {getSymbolByRealValue(realValue)}
          {' '}
        </Fragment>
      )}
      {getRealTextWithPrecision(Math.abs(realValue), precision)}
      {suffix}
    </span>
  )

  if (render) {
    return render(
      text,
      {
        mode,
        ...fieldProps,
        prefix,
        precision,
        showSymbol,
        suffix,
      },
      dom,
    )
  }

  return dom
}

export default FieldPercentRead
