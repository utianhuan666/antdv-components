import type { ProFieldFC } from '../../types'
import type { GroupProps } from './types'
import { objectToMap, proFieldParsingText } from '../Select'

type Props = NonNullable<ProFieldFC<GroupProps>['__props']> & {
  optionsValueEnum: Map<any, any> | undefined
}

export function FieldCascaderRead(props: Props) {
  const { mode, render, optionsValueEnum, ...rest } = props
  const dom = (
    <>
      {proFieldParsingText(
        rest.text,
        objectToMap(rest.valueEnum || optionsValueEnum),
      )}
    </>
  )

  if (render)
    return render(rest.text, { mode, ...rest.fieldProps }, dom) ?? null

  return dom
}

export default FieldCascaderRead
