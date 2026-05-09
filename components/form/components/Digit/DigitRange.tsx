import { defineComponent } from 'vue'
import ProFormField from '../Field'

const ProFormDigitRange = defineComponent({
  name: 'ProFormDigitRange',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProFormField valueType="digitRange" {...attrs}>
        {slots.default?.()}
      </ProFormField>
    )
  },
})

export default ProFormDigitRange
