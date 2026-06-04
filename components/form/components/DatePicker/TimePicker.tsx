import type { TimePickerProps } from 'antdv-next'
import type { FunctionalComponent } from 'vue'
import type { ProFormFieldItemProps } from '../../typing'
import { ProFormTimeRangePicker } from '../DateRangePicker/TimeRangePicker'
import ProFormField from '../Field'

export type ProFormTimePickerProps = Omit<ProFormFieldItemProps<TimePickerProps>, 'valueType' | 'fieldConfig'>

const valueType = 'time' as const

const ProFormTimePicker: FunctionalComponent<ProFormTimePickerProps> = (props, { slots }) => (
  <ProFormField
    valueType={valueType}
    fieldConfig={{ valueType, customLightMode: true }}
    {...props}
  >
    {slots.default?.()}
  </ProFormField>
)

export default Object.assign(ProFormTimePicker, {
  RangePicker: ProFormTimeRangePicker,
})
