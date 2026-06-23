import type { DatePickerProps } from 'antdv-next'
import type { ProFormFieldItemProps } from '../../typing'
import { defineComponent } from 'vue'
import { FieldTimePicker } from '../../../field'
import { ProConfigProvider } from '../../../provider'
import { useFieldContext } from '../../FieldContext'
import { ProFormTimeRangePicker } from '../DateRangePicker/TimeRangePicker'
import ProFormField from '../Field'
import { proFormFieldPropNames } from '../FormItem/warpField'

const valueType = 'time' as const

const ProFormTimePicker = defineComponent<ProFormFieldItemProps<DatePickerProps>>({
  name: 'ProFormTimePicker',
  inheritAttrs: false,
  props: proFormFieldPropNames,
  setup(rawProps) {
    const props = rawProps as ProFormFieldItemProps<DatePickerProps>
    const context = useFieldContext()

    return () => {
      const { fieldProps, proFieldProps, ...rest } = props

      return (
        <ProConfigProvider
          valueTypeMap={{
            [valueType]: {
              render: (text, currentProps) => <FieldTimePicker {...currentProps} text={text} />,
              formItemRender: (text, currentProps) => <FieldTimePicker {...currentProps} text={text} />,
            },
          }}
        >
          <ProFormField
            fieldProps={{
              getPopupContainer: context.getPopupContainer,
              ...fieldProps,
            }}
            valueType={valueType}
            proFieldProps={proFieldProps}
            fieldConfig={{
              customLightMode: true,
              valueType,
            }}
            {...rest}
          />
        </ProConfigProvider>
      )
    }
  },
})

const WrappedProFormTimePicker = ProFormTimePicker as typeof ProFormTimePicker & {
  RangePicker: typeof ProFormTimeRangePicker
}

WrappedProFormTimePicker.RangePicker = ProFormTimeRangePicker

export default WrappedProFormTimePicker
