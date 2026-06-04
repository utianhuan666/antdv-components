import type { PropType } from 'vue'
import type { ProFieldValueTypeInput } from '../../../field'
import type { NamePath } from '../../typing'
import { DatePicker, TimePicker } from 'antdv-next'
import dayjs from 'dayjs'
import { computed, defineComponent } from 'vue'
import { useFieldContext } from '../../FieldContext'
import ProFormItem from '../FormItem'

const pickerConfig: Record<string, Record<string, any>> = {
  date: { format: 'YYYY-MM-DD' },
  dateTime: { format: 'YYYY-MM-DD HH:mm:ss', showTime: true },
  dateWeek: { format: 'gggg-wo', picker: 'week' },
  dateMonth: { format: 'YYYY-MM', picker: 'month' },
  dateQuarter: { format: 'YYYY-[Q]Q', picker: 'quarter' },
  dateYear: { format: 'YYYY', picker: 'year' },
  time: { format: 'HH:mm:ss' },
}

function getValueByNamePath(model: Record<string, any>, name?: NamePath) {
  if (name === undefined)
    return undefined
  const path = Array.isArray(name) ? name : [name]
  return path.reduce<any>((current, key) => current?.[key], model)
}

function setValueByNamePath(model: Record<string, any>, name: NamePath | undefined, value: any) {
  if (name === undefined)
    return
  const path = Array.isArray(name) ? name : [name]
  const last = path[path.length - 1]
  if (last === undefined)
    return
  const parent = path.slice(0, -1).reduce<Record<string, any>>((current, key) => {
    if (!current[key] || typeof current[key] !== 'object')
      current[key] = {}
    return current[key]
  }, model)
  parent[last] = value
}

export const BaseDatePicker = defineComponent({
  name: 'BaseProFormDatePicker',
  inheritAttrs: false,
  props: {
    valueType: { type: String as PropType<ProFieldValueTypeInput>, required: true },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: any) => any>, default: undefined },
  },
  setup(props, { attrs }) {
    const fieldContext = useFieldContext()

    const name = computed(() => (attrs as Record<string, any>).name as NamePath | undefined)
    const config = computed(() => pickerConfig[String(props.valueType)] || pickerConfig.date)
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
      const currentFieldProps = {
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
          label={(attrs as any).label}
          tooltip={(attrs as any).tooltip}
          rules={(attrs as any).rules}
          required={(attrs as any).required}
          initialValue={(attrs as any).initialValue}
          valueType={props.valueType}
          dataFormat={currentFieldProps.format}
          transform={(attrs as any).transform}
          convertValue={(attrs as any).convertValue}
          formItemProps={{
            ...(fieldContext.formItemProps || {}),
            ...((attrs as any).formItemProps || {}),
          }}
        >
          {child}
        </ProFormItem>
      )
    }
  },
})
