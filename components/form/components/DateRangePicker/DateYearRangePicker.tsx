import { defineComponent } from 'vue'
import { BaseDateRanger } from './BaseDateRanger'

export const ProFormDateYearRangePicker = defineComponent({
  name: 'ProFormDateYearRangePicker',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <BaseDateRanger valueType="dateYearRange" {...attrs}>
        {slots.default?.()}
      </BaseDateRanger>
    )
  },
})
