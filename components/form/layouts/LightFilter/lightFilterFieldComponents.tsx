import type { DefineComponent } from 'vue'
import { defineComponent } from 'vue'
import ProFormCascader from '../../components/Cascader'
import ProFormCheckbox from '../../components/Checkbox'
import ProFormDatePicker from '../../components/DatePicker'
import ProFormDateTimePicker from '../../components/DatePicker/DateTimePicker'
import ProFormTimePicker from '../../components/DatePicker/TimePicker'
import ProFormDateRangePicker from '../../components/DateRangePicker'
import ProFormDateMonthRangePicker from '../../components/DateRangePicker/DateMonthRangePicker'
import ProFormDateQuarterRangePicker from '../../components/DateRangePicker/DateQuarterRangePicker'
import ProFormDateTimeRangePicker from '../../components/DateRangePicker/DateTimeRangePicker'
import ProFormDateWeekRangePicker from '../../components/DateRangePicker/DateWeekRangePicker'
import ProFormDateYearRangePicker from '../../components/DateRangePicker/DateYearRangePicker'
import ProFormTimeRangePicker from '../../components/DateRangePicker/TimeRangePicker'
import ProFormDigit from '../../components/Digit'
import ProFormDigitRange from '../../components/Digit/DigitRange'
import ProFormFieldSet from '../../components/FieldSet'
import ProFormSelect from '../../components/Select'
import ProFormSlider from '../../components/Slider'
import ProFormSwitch from '../../components/Switch'
import ProFormText from '../../components/Text'
import ProFormTextArea from '../../components/TextArea'
import ProFormTreeSelect from '../../components/TreeSelect'

function createLightFilterField(Field: DefineComponent<any>) {
  return defineComponent({
    name: 'LightFilterField',
    inheritAttrs: false,
    setup(_props, { attrs, slots }) {
      return () => (
        <Field
          {...attrs}
          proFieldProps={{
            light: true,
            ...((attrs.proFieldProps || {}) as Record<string, any>),
          }}
        >
          {slots.default?.()}
        </Field>
      )
    },
  })
}

export const lightFilterFieldComponents = {
  input: createLightFilterField(ProFormText as any),
  password: createLightFilterField((ProFormText as any).Password || ProFormText as any),
  text: createLightFilterField(ProFormText as any),
  textArea: createLightFilterField(ProFormTextArea as any),
  select: createLightFilterField(ProFormSelect as any),
  searchSelect: createLightFilterField((ProFormSelect as any).SearchSelect || ProFormSelect as any),
  treeSelect: createLightFilterField(ProFormTreeSelect as any),
  cascader: createLightFilterField(ProFormCascader as any),
  digit: createLightFilterField(ProFormDigit as any),
  digitRange: createLightFilterField(ProFormDigitRange as any),
  slider: createLightFilterField(ProFormSlider as any),
  date: createLightFilterField(ProFormDatePicker as any),
  dateTime: createLightFilterField(ProFormDateTimePicker as any),
  time: createLightFilterField(ProFormTimePicker as any),
  timeRange: createLightFilterField(ProFormTimeRangePicker as any),
  dateRange: createLightFilterField(ProFormDateRangePicker as any),
  dateTimeRange: createLightFilterField(ProFormDateTimeRangePicker as any),
  weekRange: createLightFilterField(ProFormDateWeekRangePicker as any),
  monthRange: createLightFilterField(ProFormDateMonthRangePicker as any),
  quarterRange: createLightFilterField(ProFormDateQuarterRangePicker as any),
  yearRange: createLightFilterField(ProFormDateYearRangePicker as any),
  timePickerRange: createLightFilterField(ProFormTimeRangePicker as any),
  checkboxGroup: createLightFilterField((ProFormCheckbox as any).Group || ProFormCheckbox as any),
  fieldSet: createLightFilterField(ProFormFieldSet as any),
  switch: createLightFilterField(ProFormSwitch as any),
} as const

export default lightFilterFieldComponents
