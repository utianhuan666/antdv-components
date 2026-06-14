import type { DatePickerProps } from 'antdv-next'
import type { ComponentPublicInstance } from 'vue'
import type { FieldDatePickerExpose } from '../../../field'
import type { ProFormFieldItemProps } from '../../typing'
import { computed, defineComponent, ref } from 'vue'
import { FieldDatePicker } from '../../../field'
import { ProConfigProvider } from '../../../provider'
import { createRefProxy } from '../../../utils/createRefProxy'
import { useFieldContext } from '../../FieldContext'
import ProFormField from '../Field'
import { proFormFieldPropNames } from '../FormItem/warpField'

export type ProFormDateValueType
  = | 'date'
    | 'dateTime'
    | 'dateRange'
    | 'dateTimeRange'
    | 'dateWeek'
    | 'dateMonth'
    | 'dateQuarter'
    | 'dateYear'

export type BaseDatePickerProps = ProFormFieldItemProps<DatePickerProps, FieldDatePickerExpose> & {
  valueType: ProFormDateValueType
}

type DatePickerRenderPicker = 'time' | 'date' | 'week' | 'month' | 'quarter' | 'year' | undefined
type FieldDatePickerComponentRef = ComponentPublicInstance & FieldDatePickerExpose

export const BaseDatePicker = defineComponent<BaseDatePickerProps>({
  name: 'BaseDatePicker',
  inheritAttrs: false,
  props: [...proFormFieldPropNames, 'valueType'],
  setup(rawProps, { expose }) {
    const props = rawProps as BaseDatePickerProps
    const context = useFieldContext()
    const innerRef = ref<FieldDatePickerComponentRef | null>(null)

    expose(createRefProxy<FieldDatePickerComponentRef>(innerRef))

    const mergedFieldProps = computed(() => {
      const nextFieldProps = props.fieldProps ? { ...props.fieldProps } : {}

      if (props.valueType === 'dateTime' && nextFieldProps.showTime === undefined)
        nextFieldProps.showTime = true

      return nextFieldProps
    })

    const renderFieldDatePicker = (text: any, currentProps: any) => {
      const fieldPropsFromContext = currentProps.fieldProps ?? mergedFieldProps.value
      const fieldFormat = fieldPropsFromContext?.format

      let format: string
      let picker: DatePickerRenderPicker

      switch (props.valueType) {
        case 'dateTime':
          format = fieldFormat ?? 'YYYY-MM-DD HH:mm:ss'
          break
        case 'dateWeek':
          picker = 'week'
          format = fieldFormat ?? 'gggg-wo'
          break
        case 'dateMonth':
          picker = 'month'
          format = fieldFormat ?? 'YYYY-MM'
          break
        case 'dateQuarter':
          picker = 'quarter'
          format = fieldFormat ?? 'YYYY-[Q]Q'
          break
        case 'dateYear':
          picker = 'year'
          format = fieldFormat ?? 'YYYY'
          break
        case 'date':
        default:
          format = fieldFormat ?? 'YYYY-MM-DD'
          break
      }

      return (
        <FieldDatePicker
          {...currentProps}
          format={format}
          picker={picker}
          text={text}
        />
      )
    }

    return () => {
      const {
        proFieldProps,
        fieldProps,
        valueType,
        ...rest
      } = props

      return (
        <ProConfigProvider
          valueTypeMap={{
            [valueType]: {
              render: renderFieldDatePicker,
              formItemRender: renderFieldDatePicker,
            },
          }}
        >
          <ProFormField
            {...rest}
            ref={innerRef}
            valueType={valueType}
            fieldProps={{
              getPopupContainer: context.getPopupContainer,
              ...mergedFieldProps.value,
            }}
            proFieldProps={proFieldProps}
            fieldConfig={{
              valueType,
              customLightMode: true,
            }}
          />
        </ProConfigProvider>
      )
    }
  },
})

export function createDatePicker(name: string, valueType: ProFormDateValueType) {
  return defineComponent<ProFormFieldItemProps<DatePickerProps, FieldDatePickerExpose>>({
    name,
    inheritAttrs: false,
    props: proFormFieldPropNames as any,
    setup(rawProps, { expose }) {
      const props = rawProps as ProFormFieldItemProps<DatePickerProps, FieldDatePickerExpose>
      const innerRef = ref<FieldDatePickerComponentRef | null>(null)

      expose(createRefProxy<FieldDatePickerComponentRef>(innerRef))

      return () => {
        const {
          proFieldProps,
          fieldProps,
          ...rest
        } = props

        return (
          <BaseDatePicker
            {...rest}
            ref={innerRef}
            valueType={valueType}
            fieldProps={{
              ...fieldProps,
            }}
            proFieldProps={proFieldProps}
            fieldConfig={{
              valueType,
              customLightMode: true,
            }}
          />
        )
      }
    },
  })
}

export default BaseDatePicker
