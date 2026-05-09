import { defineComponent } from 'vue'
import ProFormField from '../Field'

/** 对标 React `ProFormMoney`：valueType=money */
const ProFormMoney = defineComponent({
  name: 'ProFormMoney',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProFormField valueType="money" {...attrs}>
        {slots.default?.()}
      </ProFormField>
    )
  },
})

export default ProFormMoney
