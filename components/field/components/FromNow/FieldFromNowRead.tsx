import type { ProFieldFC } from '../../types'
import { Tooltip } from 'antdv-next'
import dayjs from 'dayjs'

type Props = NonNullable<ProFieldFC<{
  text: string
  format?: string
  variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
}>['__props']>

export function FieldFromNowRead(props: Props) {
  const { text, mode, render, format, fieldProps } = props
  const dom = (
    <Tooltip
      title={dayjs(text).format(
        fieldProps?.format || format || 'YYYY-MM-DD HH:mm:ss',
      )}
    >
      {dayjs(text).fromNow()}
    </Tooltip>
  )

  if (render)
    return render(text, { mode, ...fieldProps }, <>{dom}</>)

  return <>{dom}</>
}

export default FieldFromNowRead
