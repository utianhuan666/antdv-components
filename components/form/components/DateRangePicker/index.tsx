import { defineComponent } from 'vue'
import ProFormField from '../Field'

/** 对标 React `ProFormDateRangePicker`：valueType=dateRange */
const ProFormDateRangePicker = defineComponent({
  name: 'ProFormDateRangePicker',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProFormField valueType="dateRange" {...attrs}>
        {slots.default?.()}
      </ProFormField>
    )
  },
})

/** 对标 React `ProFormDateTimeRangePicker`：valueType=dateTimeRange */
const ProFormDateTimeRangePicker = defineComponent({
  name: 'ProFormDateTimeRangePicker',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProFormField valueType="dateTimeRange" {...attrs}>
        {slots.default?.()}
      </ProFormField>
    )
  },
})

export default ProFormDateRangePicker
export { ProFormDateTimeRangePicker }
