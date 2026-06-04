import { defineComponent } from 'vue'
import { BaseDateRanger } from './BaseDateRanger'

export const ProFormDateTimeRangePicker = defineComponent({
  name: 'ProFormDateTimeRangePicker',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <BaseDateRanger valueType="dateTimeRange" {...attrs}>
        {slots.default?.()}
      </BaseDateRanger>
    )
  },
})
