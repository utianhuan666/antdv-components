import { defineComponent } from 'vue'
import { BaseDatePicker } from './BaseDatePicker'

const ProFormDateTimePicker = defineComponent({
  name: 'ProFormDateTimePicker',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <BaseDatePicker valueType="dateTime" {...attrs}>
        {slots.default?.()}
      </BaseDatePicker>
    )
  },
})

export default ProFormDateTimePicker
