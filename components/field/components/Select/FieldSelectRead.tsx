import type { ProFieldFC } from '../../types'
import type { FieldSelectProps } from './types'
import { objectToMap, proFieldParsingText } from './index'

type Props = NonNullable<
  ProFieldFC<FieldSelectProps>['__props']
> & {
  valueEnum: FieldSelectProps['valueEnum']
  optionsValueEnum: Map<any, any> | undefined
}

export function FieldSelectRead(props: Props) {
  const { mode, render, fieldProps, valueEnum, optionsValueEnum, ...rest } = props
  const dom = (
    <>
      {proFieldParsingText(
        rest.text,
        objectToMap(valueEnum || optionsValueEnum),
      )}
    </>
  )

  if (render)
    return render(rest.text, { mode, ...fieldProps }, dom) ?? props.emptyText

  return dom
}

export default FieldSelectRead
