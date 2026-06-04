import { defineComponent } from 'vue'
import { BaseDatePicker } from './BaseDatePicker'

const ProFormDatePickerWeek = defineComponent({
  name: 'ProFormDatePickerWeek',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <BaseDatePicker valueType="dateWeek" {...attrs}>
        {slots.default?.()}
      </BaseDatePicker>
    )
  },
})

export default ProFormDatePickerWeek
