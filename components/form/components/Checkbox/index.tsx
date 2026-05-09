import { defineComponent } from 'vue'
import ProFormField from '../Field'

const ProFormCheckbox = defineComponent({
  name: 'ProFormCheckbox',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProFormField valueType="checkbox" valuePropName="checked" {...attrs}>
        {slots.default?.()}
      </ProFormField>
    )
  },
})

const ProFormCheckboxGroup = defineComponent({
  name: 'ProFormCheckboxGroup',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProFormField valueType="checkbox" {...attrs}>
        {slots.default?.()}
      </ProFormField>
    )
  },
})

;(ProFormCheckbox as any).Group = ProFormCheckboxGroup

export default ProFormCheckbox as typeof ProFormCheckbox & { Group: typeof ProFormCheckboxGroup }
export { ProFormCheckboxGroup }
