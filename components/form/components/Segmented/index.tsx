import { defineComponent } from 'vue'
import ProFormField from '../Field'

const ProFormSegmented = defineComponent({
  name: 'ProFormSegmented',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProFormField valueType="segmented" {...attrs}>
        {slots.default?.()}
      </ProFormField>
    )
  },
})

export default ProFormSegmented
