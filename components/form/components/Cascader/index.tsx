import { defineComponent } from 'vue'
import ProFormField from '../Field'

const ProFormCascader = defineComponent({
  name: 'ProFormCascader',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProFormField valueType="cascader" {...attrs}>
        {slots.default?.()}
      </ProFormField>
    )
  },
})

export default ProFormCascader
