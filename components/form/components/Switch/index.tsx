import { defineComponent } from 'vue'
import ProFormField from '../Field'

const ProFormSwitch = defineComponent({
  name: 'ProFormSwitch',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProFormField valueType="switch" valuePropName="checked" {...attrs}>
        {slots.default?.()}
      </ProFormField>
    )
  },
})

export default ProFormSwitch
