import type { ProFieldFC } from '../../types'
import { Slider } from 'antdv-next'
import type { Ref } from 'vue'

type Props = NonNullable<ProFieldFC<{ text: string }>['__props']>
type SliderInstance = InstanceType<typeof Slider>

export function FieldSliderEdit(props: Props, sliderRef?: Ref<SliderInstance | null> | null) {
  const { text, mode, formItemRender, fieldProps } = props
  const dom = (
    <Slider
      ref={sliderRef}
      {...fieldProps}
      style={{ minWidth: 120, ...fieldProps?.style }}
    />
  )

  if (formItemRender)
    return formItemRender(text, { mode, ...fieldProps }, dom)

  return dom
}

export default FieldSliderEdit
