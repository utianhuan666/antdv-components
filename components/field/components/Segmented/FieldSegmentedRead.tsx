import type { VNodeChild } from 'vue'
import type { ProFieldFC } from '../../types'
import type { FieldSelectProps } from '../Select/types'
import { objectToMap, proFieldParsingText } from '../../../utils'

type FieldSegmentedProps = NonNullable<ProFieldFC<{
  text: string
  emptyText?: VNodeChild
} & FieldSelectProps>['__props']>

type Props = FieldSegmentedProps & {
  optionsValueEnum: Record<string, any> | undefined
  emptyText: VNodeChild
}

export function FieldSegmentedRead(props: Props) {
  const {
    text,
    mode,
    render,
    fieldProps,
    emptyText,
    optionsValueEnum,
    valueEnum,
  } = props
  const dom = (
    <>{proFieldParsingText(text, objectToMap(valueEnum || optionsValueEnum))}</>
  )

  if (render)
    return render(text, { mode, ...fieldProps }, <>{dom}</>) ?? emptyText

  return dom
}

export default FieldSegmentedRead
