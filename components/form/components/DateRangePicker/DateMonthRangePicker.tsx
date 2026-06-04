import { defineComponent } from 'vue'
import { BaseDateRanger } from './BaseDateRanger'

export const ProFormDateMonthRangePicker = defineComponent({
  name: 'ProFormDateMonthRangePicker',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <BaseDateRanger valueType="dateMonthRange" {...attrs}>
        {slots.default?.()}
      </BaseDateRanger>
    )
  },
})
