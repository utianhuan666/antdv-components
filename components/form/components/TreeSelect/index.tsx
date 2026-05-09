import { defineComponent } from 'vue'
import ProFormField from '../Field'

const ProFormTreeSelect = defineComponent({
  name: 'ProFormTreeSelect',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProFormField valueType="treeSelect" {...attrs}>
        {slots.default?.()}
      </ProFormField>
    )
  },
})

export default ProFormTreeSelect
