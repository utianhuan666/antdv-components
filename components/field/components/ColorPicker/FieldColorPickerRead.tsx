import type { ProFieldFC } from '../../types'
import { ColorPicker } from 'antdv-next'

type Props = NonNullable<ProFieldFC<{ text: string }>['__props']>

export function FieldColorPickerRead(props: Props) {
  const { text, mode, render, fieldProps } = props
  const dom = (
    <ColorPicker
      value={text}
      class="ant-pro-field-color-picker"
      open={false}
    />
  )

  if (render)
    return render(text, { mode, ...fieldProps }, dom)

  return dom
}

export default FieldColorPickerRead
