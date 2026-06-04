import { defineComponent } from 'vue'
import { BaseDateRanger } from './BaseDateRanger'

export const ProFormDateQuarterRangePicker = defineComponent({
  name: 'ProFormDateQuarterRangePicker',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <BaseDateRanger valueType="dateQuarterRange" {...attrs}>
        {slots.default?.()}
      </BaseDateRanger>
    )
  },
})
