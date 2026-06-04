import { defineComponent } from 'vue'
import { BaseDateRanger } from './BaseDateRanger'
import { ProFormDateMonthRangePicker } from './DateMonthRangePicker'
import { ProFormDateQuarterRangePicker } from './DateQuarterRangePicker'
import { ProFormDateTimeRangePicker } from './DateTimeRangePicker'
import { ProFormDateWeekRangePicker } from './DateWeekRangePicker'
import { ProFormDateYearRangePicker } from './DateYearRangePicker'
import { ProFormTimeRangePicker } from './TimeRangePicker'

/** 对标 React `ProFormDateRangePicker`：valueType=dateRange */
const ProFormDateRangePicker = defineComponent({
  name: 'ProFormDateRangePicker',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <BaseDateRanger valueType="dateRange" {...attrs}>
        {slots.default?.()}
      </BaseDateRanger>
    )
  },
})

export default ProFormDateRangePicker
export {
  ProFormDateMonthRangePicker,
  ProFormDateQuarterRangePicker,
  ProFormDateTimeRangePicker,
  ProFormDateWeekRangePicker,
  ProFormDateYearRangePicker,
  ProFormTimeRangePicker,
}
