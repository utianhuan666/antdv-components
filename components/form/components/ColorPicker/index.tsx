import { defineComponent } from 'vue'
import ProFormField from '../Field'

const ProFormColorPicker = defineComponent({
  name: 'ProFormColorPicker',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProFormField valueType="color" {...attrs}>
        {slots.default?.()}
      </ProFormField>
    )
  },
})

export default ProFormColorPicker
