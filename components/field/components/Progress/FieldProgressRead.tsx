import type { Ref } from 'vue'
import type { ProFieldFC } from '../../types'
import { Progress } from 'antdv-next'
import { getProgressStatus } from './utils'

type InputNumberInstance = InstanceType<typeof import('antdv-next')['InputNumber']>
type ProgressInstance = InstanceType<typeof import('antdv-next')['Progress']>

type Props = Parameters<
  ProFieldFC<{
    text: number | string
    placeholder?: string
  }>
>[0] & {
  realValue: number | string
}

export function FieldProgressRead(props: Props, ref?: Ref<InputNumberInstance | ProgressInstance | null>) {
  const { mode, render, fieldProps, realValue } = props
  const dom = (
    <Progress
      ref={ref}
      size="small"
      style={{ minWidth: 100, maxWidth: 320 }}
      percent={realValue as number}
      steps={fieldProps?.steps}
      status={getProgressStatus(realValue as number)}
      {...fieldProps}
    />
  )
  if (render) {
    return render(realValue, { mode, ...fieldProps }, dom)
  }
  return dom
}
