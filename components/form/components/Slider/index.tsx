import type { SliderProps } from 'antdv-next'
import type { ProFormFieldItemProps } from '../../typing'
import type { ComponentPublicInstance } from 'vue'
import { defineComponent, ref } from 'vue'
import { createRefProxy } from '../../../utils/createRefProxy'
import ProFormField from '../Field'

export type ProFormSliderProps = ProFormFieldItemProps<SliderProps>
export const ProFormSlider = defineComponent({
  name: 'ProFormSlider',
  inheritAttrs: false,
  setup(_p, { attrs, expose }) {
    const innerRef = ref<ComponentPublicInstance | null>(null)
    expose(createRefProxy<ComponentPublicInstance>(innerRef))
    return () => <ProFormField ref={innerRef} {...attrs as any} valueType="slider" />
  },
})
export default ProFormSlider
