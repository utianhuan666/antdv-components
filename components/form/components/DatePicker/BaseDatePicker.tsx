import type { DatePickerProps } from 'antdv-next'
import type { VNodeChild } from 'vue'
import type { ProFieldValueType } from '../../../field'
import type { NamePath, ProFormFieldItemProps } from '../../typing'
import { DatePicker, TimePicker } from 'antdv-next'
import dayjs from 'dayjs'
import { computed, defineComponent } from 'vue'
import { getValueByNamePath, setValueByNamePath } from '../../../utils'
import { useFieldContext } from '../../FieldContext'
import ProFormItem from '../FormItem'

export type BaseDatePickerValueType = Extract<
  ProFieldValueType,
  'date' | 'dateTime' | 'dateWeek' | 'dateMonth' | 'dateQuarter' | 'dateYear' | 'time'
>

export type BaseDatePickerProps = Omit<ProFormFieldItemProps, 'valueType'> & {
  valueType: BaseDatePickerValueType
  formItemRender?: (text: any, props: Record<string, any>, dom: VNodeChild) => VNodeChild
}

interface PickerConfig {
  format: string
  showTime?: DatePickerProps['showTime']
  picker?: DatePickerProps['picker']
}

const pickerConfig: Record<BaseDatePickerValueType, PickerConfig> = {
  date: { format: 'YYYY-MM-DD' },
  dateTime: { format: 'YYYY-MM-DD HH:mm:ss', showTime: true },
  dateWeek: { format: 'gggg-wo', picker: 'week' },
  dateMonth: { format: 'YYYY-MM', picker: 'month' },
  dateQuarter: { format: 'YYYY-[Q]Q', picker: 'quarter' },
  dateYear: { format: 'YYYY', picker: 'year' },
  time: { format: 'HH:mm:ss' },
}

export const BaseDatePicker = defineComponent({
  name: 'BaseProFormDatePicker',
  inheritAttrs: false,
  props: ['valueType', 'fieldProps', 'formItemRender'],
  setup(rawProps, { attrs }) {
    const props = rawProps as Readonly<BaseDatePickerProps>
    const fieldContext = useFieldContext()
    const attrsProps = attrs as Partial<BaseDatePickerProps>

    const name = computed(() => attrsProps.name as NamePath | undefined)
    const config = computed(() => pickerConfig[props.valueType] || pickerConfig.date)
    const value = computed(() => getValueByNamePath(fieldContext.model || {}, name.value))
    const pickerValue = computed(() => {
      const currentValue = value.value
      if (!currentValue || typeof currentValue !== 'string')
        return currentValue
      return dayjs(currentValue, (config.value || {}).format)
    })

    function handleChange(nextValue: any, dateString?: string | string[]) {
      setValueByNamePath(fieldContext.model || {}, name.value, nextValue)
      props.fieldProps?.onChange?.(nextValue, dateString)
    }

    return () => {
      const currentConfig = config.value || {}
      const currentFieldProps: Record<string, any> = {
        ...currentConfig,
        ...(props.fieldProps || {}),
      }
      const Component = props.valueType === 'time' ? TimePicker : DatePicker
      const dom = (
        <Component
          {...currentFieldProps}
          value={pickerValue.value}
          onChange={handleChange}
        />
      )
      const child = props.formItemRender
        ? props.formItemRender(value.value, { mode: 'edit', ...currentFieldProps }, dom)
        : dom

      if (name.value === undefined)
        return child

      return (
        <ProFormItem
          name={name.value}
          label={attrsProps.label}
          tooltip={attrsProps.tooltip}
          rules={attrsProps.rules}
          required={attrsProps.required}
          initialValue={attrsProps.initialValue}
          valueType={props.valueType}
          dataFormat={currentFieldProps.format}
          transform={attrsProps.transform}
          convertValue={attrsProps.convertValue}
          formItemProps={{
            ...(fieldContext.formItemProps || {}),
            ...(attrsProps.formItemProps || {}),
          }}
        >
          {child}
        </ProFormItem>
      )
    }
  },
})
