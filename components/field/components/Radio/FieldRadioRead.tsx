import type { ProFieldFC } from '../../types'
import type { GroupProps } from './types'
import { objectToMap, proFieldParsingText } from '../../../utils'

type Props = NonNullable<ProFieldFC<GroupProps>['__props']> & {
  optionsValueEnum: Record<string, any> | undefined
}

export function FieldRadioRead(props: Props) {
  const { mode, render, optionsValueEnum, ...rest } = props
  const parsedText = rest.text
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

export default FieldRadioRead
