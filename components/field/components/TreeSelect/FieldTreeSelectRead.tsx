import type { ProSchemaValueEnumMap } from '../../../utils/typing'
import type { ProFieldFC } from '../../types'
import type { FieldSelectProps } from '../Select'
import type { RequestOptionsType } from '../Select/types'
import { objectToMap, proFieldParsingText } from '../../../utils'

type Props = NonNullable<ProFieldFC<{} & FieldSelectProps>['__props']> & {
  optionsValueEnum: ProSchemaValueEnumMap | undefined
  options: RequestOptionsType[]
}

export function FieldTreeSelectRead(props: Props) {
  const { mode, render, fieldProps, optionsValueEnum, options, ...rest } = props
  const dom = (
    <>
      {proFieldParsingText(
        (rest.text ?? '') as string | number | Array<string | number>,
        objectToMap(rest.valueEnum || optionsValueEnum),
      )}
    </>
  )

  if (render)
    return render(rest.text, { mode, ...fieldProps, treeData: options }, dom) ?? null

  return dom
}

export default FieldTreeSelectRead
