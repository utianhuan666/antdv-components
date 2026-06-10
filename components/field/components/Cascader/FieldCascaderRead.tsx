import type { ProFieldFC } from '../../types'
import type { GroupProps } from './types'
import { objectToMap, proFieldParsingText } from '../../../utils'

type ParsedText = string | number | (string | number)[]

type Props = NonNullable<ProFieldFC<GroupProps>['__props']> & {
  optionsValueEnum: Map<any, any> | undefined
}

export function FieldCascaderRead(props: Props) {
  const { mode, render, optionsValueEnum, ...rest } = props
  const parsedText = rest.text as ParsedText | null | undefined
  const dom = (
    <>
      {parsedText == null
        ? parsedText
        : proFieldParsingText(
              parsedText,
              objectToMap(rest.valueEnum || optionsValueEnum),
            )}
    </>
  )

  if (render)
    return render(rest.text, { mode, ...rest.fieldProps }, dom) ?? null

  return dom
}

export default FieldCascaderRead
