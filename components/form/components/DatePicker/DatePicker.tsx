import { defineComponent } from 'vue'
import { BaseDatePicker } from './BaseDatePicker'

const ProFormDatePicker = defineComponent({
  name: 'ProFormDatePicker',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <BaseDatePicker valueType="date" {...attrs}>
        {slots.default?.()}
      </BaseDatePicker>
    )
  },
})

export default ProFormDatePicker
