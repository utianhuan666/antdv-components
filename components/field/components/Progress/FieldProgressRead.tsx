import type { ProFieldFC } from '../../types'
import { Progress } from 'antdv-next'
import { getProgressStatus } from './utils'

type Props = NonNullable<ProFieldFC<{
  text: number | string
  placeholder?: string
}>['__props']> & {
  realValue: number | string
}

export function FieldProgressRead(props: Props) {
  const { mode, render, fieldProps, realValue } = props
  const dom = (
    <Progress
      size="small"
      style={{ minWidth: 100, maxWidth: 320 }}
      percent={realValue as number}
      steps={fieldProps?.steps}
      status={getProgressStatus(realValue as number)}
      {...fieldProps}
    />
  )

  if (render)
    return render(realValue, { mode, ...fieldProps }, dom)

  return dom
}

export default FieldProgressRead
