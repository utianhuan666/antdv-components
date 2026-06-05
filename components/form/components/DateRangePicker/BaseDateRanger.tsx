import type { RangePickerProps } from 'antdv-next'
import type { VNodeChild } from 'vue'
import type { ProFieldValueType } from '../../../field'
import type { NamePath, ProFormFieldItemProps } from '../../typing'
import { DateRangePicker } from 'antdv-next'
import dayjs from 'dayjs'
import { computed, defineComponent } from 'vue'
import { getValueByNamePath, setValueByNamePath } from '../../../utils'
import { useFieldContext } from '../../FieldContext'
import ProFormItem from '../FormItem'

export type BaseDateRangerValueType = Extract<
  ProFieldValueType,
  | 'dateRange'
  | 'dateTimeRange'
  | 'dateWeekRange'
  | 'dateMonthRange'
  | 'dateQuarterRange'
  | 'dateYearRange'
  | 'timeRange'
>

export type BaseDateRangerProps = Omit<ProFormFieldItemProps<RangePickerProps>, 'valueType'> & {
  valueType: BaseDateRangerValueType
  formItemRender?: (text: any, props: Record<string, any>, dom: VNodeChild) => VNodeChild
}

interface RangeConfig {
  format: string
  showTime?: RangePickerProps['showTime']
  picker?: RangePickerProps['picker']
}

const rangeConfig: Record<BaseDateRangerValueType, RangeConfig> = {
  dateRange: { format: 'YYYY-MM-DD' },
  dateTimeRange: { format: 'YYYY-MM-DD HH:mm:ss', showTime: true },
  dateWeekRange: { format: 'gggg-wo', picker: 'week', showTime: true },
  dateMonthRange: { format: 'YYYY-MM', picker: 'month', showTime: true },
  dateQuarterRange: { format: 'YYYY-[Q]Q', picker: 'quarter', showTime: true },
  dateYearRange: { format: 'YYYY', picker: 'year', showTime: true },
  timeRange: { format: 'HH:mm:ss' },
}

export const BaseDateRanger = defineComponent({
  name: 'BaseProFormDateRanger',
  inheritAttrs: false,
  props: ['valueType', 'fieldProps', 'formItemRender'],
  setup(rawProps, { attrs }) {
    const props = rawProps as Readonly<BaseDateRangerProps>
    const fieldContext = useFieldContext()
    const attrsProps = attrs as Partial<BaseDateRangerProps>

    const name = computed(() => attrsProps.name as NamePath | undefined)
    const config = computed(() => rangeConfig[props.valueType] || rangeConfig.dateRange)
    const value = computed(() => getValueByNamePath(fieldContext.model || {}, name.value))
    const pickerValue = computed(() => {
      if (!Array.isArray(value.value))
        return value.value
      const format = (config.value || {}).format
      return value.value.map((item: any) => typeof item === 'string' ? dayjs(item, format) : item)
    })

    function handleChange(nextValue: any, dateString?: string | string[]) {
      setValueByNamePath(fieldContext.model || {}, name.value, nextValue)
      props.fieldProps?.onChange?.(nextValue, dateString)
    }

    return () => {
      const currentFieldProps = {
        ...(config.value || {}),
        ...(props.fieldProps || {}),
      }
      const dom = (
        <DateRangePicker
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
