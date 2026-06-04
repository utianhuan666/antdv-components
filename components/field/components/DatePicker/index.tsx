import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldDatePickerEdit from './FieldDatePickerEdit'
import FieldDatePickerLightEdit from './FieldDatePickerLightEdit'
import FieldDatePickerRead from './FieldDatePickerRead'

dayjs.extend(weekOfYear)

const FieldDatePicker = defineComponent({
  name: 'FieldDatePicker',
  props: {
    text: { type: [String, Number, Object] as PropType<string | number | Record<string, any>>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    format: { type: String, default: 'YYYY-MM-DD' },
    label: { type: null as unknown as PropType<any>, default: undefined },
    light: { type: Boolean, default: false },
    variant: { type: String as PropType<'outlined' | 'borderless' | 'filled' | 'underlined'>, default: undefined },
    showTime: { type: [Boolean, Object] as PropType<boolean | Record<string, any>>, default: undefined },
    picker: { type: String as PropType<'time' | 'date' | 'week' | 'month' | 'quarter' | 'year'>, default: undefined },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
  },
  setup(props) {
    return () => {
      if (isProFieldReadMode(props.mode)) {
        return (
          <FieldDatePickerRead
            text={props.text}
            mode={props.mode}
            format={props.format}
            render={props.render}
            fieldProps={props.fieldProps}
            picker={props.picker}
          />
        )
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        if (props.light) {
          return (
            <FieldDatePickerLightEdit
              text={props.text}
              mode={props.mode}
              label={props.label}
              format={props.format}
              showTime={props.showTime}
              picker={props.picker}
              variant={props.variant}
              formItemRender={props.formItemRender}
              fieldProps={props.fieldProps}
            />
          )
        }

        return (
          <FieldDatePickerEdit
            text={props.text}
            mode={props.mode}
            format={props.format}
            showTime={props.showTime}
            picker={props.picker}
            variant={props.variant}
            formItemRender={props.formItemRender}
            fieldProps={props.fieldProps}
          />
        )
      }

      return null
    }
  },
})

export default FieldDatePicker
