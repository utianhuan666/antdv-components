import { defineComponent } from 'vue'
import { ProFormTimeRangePicker } from '../DateRangePicker/TimeRangePicker'
import ProFormField from '../Field'

const ProFormTimePicker = defineComponent({
  name: 'ProFormTimePicker',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProFormField
        valueType="time"
        fieldConfig={{ valueType: 'time', customLightMode: true }}
        {...attrs}
      >
        {slots.default?.()}
      </ProFormField>
    )
  },
})

;(ProFormTimePicker as any).RangePicker = ProFormTimeRangePicker

export default ProFormTimePicker as typeof ProFormTimePicker & {
  RangePicker: typeof ProFormTimeRangePicker
}
