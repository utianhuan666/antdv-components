import type { Ref } from 'vue'
import type { ProFieldFC } from '../../types'
import { Slider } from 'antdv-next'

type Props = NonNullable<ProFieldFC<{ text: string }>['__props']>

export function FieldSliderEdit(props: Props, sliderRef?: Ref<unknown> | null) {
  const { text, mode, formItemRender, fieldProps } = props
  const dom = (
    <Slider
      ref={sliderRef as any}
      {...fieldProps}
      style={{ minWidth: 120, ...fieldProps?.style }}
    />
  )

  if (formItemRender)
    return formItemRender(text, { mode, ...fieldProps }, dom)

  return dom
}

export default FieldSliderEdit
