import type { ProFieldFC } from '../../types'
import type { FieldSelectProps } from './types'
import type { ProSchemaValueEnumMap } from '../../../utils/typing'
import { objectToMap, proFieldParsingText } from '../../../utils'

type Props = NonNullable<
  ProFieldFC<FieldSelectProps>['__props']
> & {
  valueEnum: FieldSelectProps['valueEnum']
  optionsValueEnum: ProSchemaValueEnumMap | undefined
}

export function FieldSelectRead(props: Props) {
  const { mode, render, fieldProps, valueEnum, optionsValueEnum, ...rest } = props
  const dom = (
    <>
      {proFieldParsingText(
        (rest.text ?? '') as string | number | Array<string | number>,
        objectToMap(valueEnum || optionsValueEnum),
      )}
    </>
  )

  if (render)
    return render(dom, { mode, ...fieldProps }, dom) ?? null

  return dom
}

export default FieldSelectRead
