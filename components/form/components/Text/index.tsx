import { defineComponent } from 'vue'
import ProFormField from '../Field'

/** 对标 React `ProFormText`：valueType=text */
const ProFormText = defineComponent({
  name: 'ProFormText',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProFormField valueType="text" {...attrs}>
        {slots.default?.()}
      </ProFormField>
    )
  },
})

/** ProFormText.Password */
const ProFormTextPassword = defineComponent({
  name: 'ProFormTextPassword',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProFormField valueType="password" {...attrs}>
        {slots.default?.()}
      </ProFormField>
    )
  },
})

;(ProFormText as any).Password = ProFormTextPassword

export default ProFormText as typeof ProFormText & { Password: typeof ProFormTextPassword }
export { ProFormTextPassword }
