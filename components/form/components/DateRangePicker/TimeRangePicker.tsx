import { defineComponent } from 'vue'
import ProFormField from '../Field'

export const ProFormTimeRangePicker = defineComponent({
  name: 'ProFormTimeRangePicker',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProFormField
        valueType="timeRange"
        fieldConfig={{ valueType: 'timeRange', customLightMode: true }}
        {...attrs}
      >
        {slots.default?.()}
      </ProFormField>
    )
  },
})
