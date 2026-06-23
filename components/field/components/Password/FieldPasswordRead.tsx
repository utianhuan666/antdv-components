import type { Ref, VNodeChild } from 'vue'
import type { ProFieldFC } from '../../types'
import { EyeInvisibleOutlined, EyeOutlined } from '@antdv-next/icons'
import { Space } from 'antdv-next'

type InputPasswordInstance = InstanceType<typeof import('antdv-next')['InputPassword']>

type Props = NonNullable<ProFieldFC<{
  text: string | number
  open?: boolean
  onOpenChange?: (open: boolean) => void
}>['__props']> & {
  open: boolean
  setOpen: (updater: boolean | ((prev: boolean) => boolean)) => void
}

export function FieldPasswordRead(props: Props, ref?: Ref<InputPasswordInstance | HTMLSpanElement | null>) {
  const { text, mode, render, fieldProps, open, setOpen } = props
  let dom: VNodeChild = <>-</>
  if (text) {
    dom = (
      <Space>
        <span ref={ref}>{open ? text : '********'}</span>
        <a onClick={() => setOpen(!open)}>
          {open ? <EyeOutlined /> : <EyeInvisibleOutlined />}
        </a>
      </Space>
    )
  }

  if (render)
    return render(text, { mode, ...fieldProps }, dom)

  return dom
}

export default FieldPasswordRead
