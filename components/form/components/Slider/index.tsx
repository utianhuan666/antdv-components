import type { SliderProps } from 'antdv-next'
import type { ProFormFieldItemProps } from '../../typing'
import { defineComponent } from 'vue'
import ProFormField from '../Field'

export type ProFormSliderProps = ProFormFieldItemProps<SliderProps>
export const ProFormSlider = defineComponent({ name: 'ProFormSlider', inheritAttrs: false, setup: (_p, { attrs }) => () => <ProFormField {...attrs as any} valueType="slider" /> })
export default ProFormSlider
