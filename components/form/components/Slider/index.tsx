import { defineComponent } from 'vue'
import ProFormField from '../Field'

const ProFormSlider = defineComponent({
  name: 'ProFormSlider',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProFormField valueType="slider" {...attrs}>
        {slots.default?.()}
      </ProFormField>
    )
  },
})

export default ProFormSlider
