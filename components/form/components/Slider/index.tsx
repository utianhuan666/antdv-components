import type { SliderProps } from 'antdv-next'
import type { FunctionalComponent } from 'vue'
import type { ProFormFieldItemProps } from '../../typing'
import ProFormField from '../Field'

export type ProFormSliderProps = ProFormFieldItemProps<SliderProps> & {
  range?: SliderProps['range']
  min?: SliderProps['min']
  max?: SliderProps['max']
  step?: SliderProps['step']
  marks?: SliderProps['marks']
  vertical?: SliderProps['vertical']
}

const ProFormSlider: FunctionalComponent<ProFormSliderProps> = (props, { slots }) => (
  <ProFormField valueType="slider" {...props}>
    {slots.default?.()}
  </ProFormField>
)

ProFormSlider.displayName = 'ProFormSlider'
ProFormSlider.inheritAttrs = false

export default ProFormSlider
