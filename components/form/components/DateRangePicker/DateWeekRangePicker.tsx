import { defineComponent } from 'vue'
import { BaseDateRanger } from './BaseDateRanger'

export const ProFormDateWeekRangePicker = defineComponent({
  name: 'ProFormDateWeekRangePicker',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <BaseDateRanger valueType="dateWeekRange" {...attrs}>
        {slots.default?.()}
      </BaseDateRanger>
    )
  },
})
