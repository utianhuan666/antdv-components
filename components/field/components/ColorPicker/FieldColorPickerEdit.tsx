import type { CSSProperties } from 'vue'
import type { ProFieldFC } from '../../types'
import { clsx } from '@v-c/util'
import { ColorPicker } from 'antdv-next'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'

const DEFAULT_PRESETS = {
  label: 'Recommended',
  colors: [
    '#F5222D',
    '#FA8C16',
    '#FADB14',
    '#8BBB11',
    '#52C41A',
    '#13A8A8',
    '#1677FF',
    '#2F54EB',
    '#722ED1',
    '#EB2F96',
    '#F5222D4D',
    '#FA8C164D',
    '#FADB144D',
    '#8BBB114D',
    '#52C41A4D',
    '#13A8A84D',
    '#1677FF4D',
    '#2F54EB4D',
    '#722ED14D',
    '#EB2F964D',
  ],
}

type Props = NonNullable<ProFieldFC<{ text: string }>['__props']>

export function FieldColorPickerEdit(props: Props) {
  const { text, mode, formItemRender, fieldProps } = props
  const prefixCls = useProPrefixCls('pro-field-color-picker')
  const style = { display: 'table-cell', ...(fieldProps?.style as CSSProperties) }
  const dom = (
    <ColorPicker
      presets={[DEFAULT_PRESETS]}
      {...fieldProps}
      style={style}
      class={[prefixCls.value, fieldProps?.class]}
      rootClass={clsx(prefixCls.value, fieldProps?.rootClass)}
    />
  )

  if (formItemRender)
    return formItemRender(text, { mode, ...fieldProps, style }, dom)

  return dom
}

export default FieldColorPickerEdit
