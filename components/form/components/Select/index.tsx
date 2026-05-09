import { defineComponent } from 'vue'
import ProFormField from '../Field'

/** 对标 React `ProFormSelect`：valueType=select */
const ProFormSelect = defineComponent({
  name: 'ProFormSelect',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProFormField valueType="select" {...attrs}>
        {slots.default?.()}
      </ProFormField>
    )
  },
})

export default ProFormSelect
