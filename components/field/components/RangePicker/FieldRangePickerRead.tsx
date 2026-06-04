import type { ProFieldFC, ProFieldLightProps } from '../../types'

type Props = NonNullable<
  ProFieldFC<
    {
      text: string[]
      format?: string
      variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
      showTime?: boolean | Record<string, any>
      picker?: 'time' | 'date' | 'week' | 'month' | 'quarter' | 'year'
    } & ProFieldLightProps
  >['__props']
> & {
  parsedStartText: string
  parsedEndText: string
}

export function FieldRangePickerRead(props: Props) {
  const { text, mode, render, parsedStartText, parsedEndText } = props
  const fieldProps = props.fieldProps || {}
  const start = parsedStartText
  const end = parsedEndText
  const content = !start && !end ? '-' : `${start || '-'} ~ ${end || '-'}`
  const dom = (
    <div>{content}</div>
  )
  if (render)
    return render(text, { mode, ...fieldProps }, <span>{dom}</span>)
  return dom
}

export default FieldRangePickerRead
