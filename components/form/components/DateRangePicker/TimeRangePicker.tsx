import type { TimeRangePickerProps } from 'antdv-next'
import type { FunctionalComponent } from 'vue'
import type { ProFormFieldItemProps } from '../../typing'
import ProFormField from '../Field'

export type ProFormTimeRangePickerProps = Omit<ProFormFieldItemProps<TimeRangePickerProps>, 'valueType' | 'fieldConfig'>

const valueType = 'timeRange' as const

export const ProFormTimeRangePicker: FunctionalComponent<ProFormTimeRangePickerProps> = (props, { slots }) => (
  <ProFormField
    valueType={valueType}
    fieldConfig={{ valueType, customLightMode: true }}
    {...props}
  >
    {slots.default?.()}
  </ProFormField>
)
