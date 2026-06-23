import type { Ref } from 'vue'
import type { ProFieldFC } from '../../types'
import type { FieldRangePickerProps } from './types'

type Props = NonNullable<ProFieldFC<FieldRangePickerProps>['__props']> & {
  parsedStartText: string
  parsedEndText: string
}

export function FieldRangePickerRead(props: Props, ref?: Ref) {
  const { text, mode, render, parsedStartText, parsedEndText } = props
  const fieldProps = props.fieldProps || {}
  const start = parsedStartText
  const end = parsedEndText
  const content = !start && !end ? '-' : `${start || '-'} ~ ${end || '-'}`
  const dom = (
    <div ref={ref}>{content}</div>
  )
  if (render)
    return render(text, { mode, ...fieldProps }, <span>{dom}</span>)
  return dom
}

export default FieldRangePickerRead
