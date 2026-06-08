import type { ProFieldFC } from '../../types'
import type { FieldSelectProps } from '../Select'
import { objectToMap, proFieldParsingText } from '../../../utils'

type Props = NonNullable<ProFieldFC<{} & FieldSelectProps>['__props']> & {
  optionsValueEnum: Map<any, any> | undefined
  options: any[]
}

export function FieldTreeSelectRead(props: Props) {
  const { mode, render, fieldProps, optionsValueEnum, options, ...rest } = props
  const dom = (
    <>
      {proFieldParsingText(
        rest.text,
        objectToMap(rest.valueEnum || optionsValueEnum),
      )}
    </>
  )

  if (render)
    return render(rest.text, { mode, ...fieldProps, treeData: options }, dom) ?? null

  return dom
}

export default FieldTreeSelectRead
