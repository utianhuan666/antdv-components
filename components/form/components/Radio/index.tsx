import { defineComponent } from 'vue'
import ProFormField from '../Field'

const ProFormRadio = defineComponent({
  name: 'ProFormRadio',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProFormField valueType="radio" {...attrs}>
        {slots.default?.()}
      </ProFormField>
    )
  },
})

const ProFormRadioGroup = defineComponent({
  name: 'ProFormRadioGroup',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProFormField valueType="radio" {...attrs}>
        {slots.default?.()}
      </ProFormField>
    )
  },
})

const ProFormRadioButton = defineComponent({
  name: 'ProFormRadioButton',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProFormField valueType="radioButton" {...attrs}>
        {slots.default?.()}
      </ProFormField>
    )
  },
})

;(ProFormRadio as any).Group = ProFormRadioGroup
;(ProFormRadio as any).Button = ProFormRadioButton

export default ProFormRadio as typeof ProFormRadio & {
  Group: typeof ProFormRadioGroup
  Button: typeof ProFormRadioButton
}
export { ProFormRadioButton, ProFormRadioGroup }
