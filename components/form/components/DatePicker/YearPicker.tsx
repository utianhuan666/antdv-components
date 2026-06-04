import { defineComponent } from 'vue'
import { BaseDatePicker } from './BaseDatePicker'

const ProFormDatePickerYear = defineComponent({
  name: 'ProFormDatePickerYear',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <BaseDatePicker valueType="dateYear" {...attrs}>
        {slots.default?.()}
      </BaseDatePicker>
    )
  },
})

export default ProFormDatePickerYear
