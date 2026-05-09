import { defineComponent } from 'vue'
import ProFormField from '../Field'

/** 对标 React `ProFormDatePicker`：valueType=date */
const ProFormDatePicker = defineComponent({
  name: 'ProFormDatePicker',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProFormField valueType="date" {...attrs}>
        {slots.default?.()}
      </ProFormField>
    )
  },
})

/** 对标 React `ProFormDateTimePicker`：valueType=dateTime */
const ProFormDateTimePicker = defineComponent({
  name: 'ProFormDateTimePicker',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProFormField valueType="dateTime" {...attrs}>
        {slots.default?.()}
      </ProFormField>
    )
  },
})

/** 对标 React `ProFormTimePicker`：valueType=time */
const ProFormTimePicker = defineComponent({
  name: 'ProFormTimePicker',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProFormField valueType="time" {...attrs}>
        {slots.default?.()}
      </ProFormField>
    )
  },
})

export default ProFormDatePicker
export { ProFormDateTimePicker, ProFormTimePicker }
