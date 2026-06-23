import type { ProFieldFC } from '../../types'
import { ColorPicker } from 'antdv-next'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'

type Props = NonNullable<ProFieldFC<{ text: string }>['__props']>

export function FieldColorPickerRead(props: Props) {
  const { text, mode, render, fieldProps } = props
  const prefixCls = useProPrefixCls('pro-field-color-picker')
  const dom = (
    <ColorPicker
      value={text}
      class={prefixCls.value}
      rootClass={prefixCls.value}
      open={false}
    />
  )

  if (render)
    return render(text, { mode, ...fieldProps }, dom)

  return dom
}

export default FieldColorPickerRead
