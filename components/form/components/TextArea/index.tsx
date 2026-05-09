import { defineComponent } from 'vue'
import ProFormField from '../Field'

/** 对标 React `ProFormTextArea`：valueType=textarea */
const ProFormTextArea = defineComponent({
  name: 'ProFormTextArea',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProFormField valueType="textarea" {...attrs}>
        {slots.default?.()}
      </ProFormField>
    )
  },
})

export default ProFormTextArea
