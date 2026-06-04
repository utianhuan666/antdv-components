import { defineComponent } from 'vue'
import { BaseDatePicker } from './BaseDatePicker'

const ProFormDatePickerMonth = defineComponent({
  name: 'ProFormDatePickerMonth',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <BaseDatePicker valueType="dateMonth" {...attrs}>
        {slots.default?.()}
      </BaseDatePicker>
    )
  },
})

export default ProFormDatePickerMonth
