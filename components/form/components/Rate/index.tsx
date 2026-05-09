import { defineComponent } from 'vue'
import ProFormField from '../Field'

const ProFormRate = defineComponent({
  name: 'ProFormRate',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProFormField valueType="rate" {...attrs}>
        {slots.default?.()}
      </ProFormField>
    )
  },
})

export default ProFormRate
