import { defineComponent } from 'vue'
import ProFormField from '../Field'

/** 对标 React `ProFormDigit`：valueType=digit */
const ProFormDigit = defineComponent({
  name: 'ProFormDigit',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProFormField valueType="digit" {...attrs}>
        {slots.default?.()}
      </ProFormField>
    )
  },
})

export default ProFormDigit
